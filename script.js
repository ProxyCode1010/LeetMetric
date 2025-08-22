document.addEventListener("DOMContentLoaded", function () {
    // ==============================
    // LeetCode Stats Code
    // ==============================
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        if (!regex.test(username)) {
            alert("Invalid Username");
            return false;
        }
        return true;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
            if (!response.ok) throw new Error("Unable to fetch the User details");

            const data = await response.json();

            if (data.status !== "success") {
                statsContainer.innerHTML = `<p>User not found</p>`;
                return;
            }

            displayUserData(data);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = total > 0 ? (solved / total) * 100 : 0;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(data) {
        updateProgress(data.easySolved, data.totalEasy, easyLabel, easyProgressCircle);
        updateProgress(data.mediumSolved, data.totalMedium, mediumLabel, mediumProgressCircle);
        updateProgress(data.hardSolved, data.totalHard, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Total Solved", value: data.totalSolved },
            { label: "Total Questions", value: data.totalQuestions },
            { label: "Acceptance Rate", value: `${data.acceptanceRate}%` },
            { label: "Ranking", value: data.ranking },
        ];

        cardStatsContainer.innerHTML = cardsData.map(
            d => `
                <div class="card">
                    <h4>${d.label}</h4>
                    <p>${d.value}</p>
                </div>
            `
        ).join("");
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value;
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });

    // ==============================
    // Company-wise & Category-wise Questions Code + Study Plans + Extra Stats
    // ==============================
    async function loadQuestions() {
        try {
            const response = await fetch("dsa.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Company Section
            const companySelect = document.getElementById("company-select");
            const companyQuestionsContainer = document.getElementById("company-questions");

            // Category Section  
            const categorySelect = document.getElementById("category-select");
            const categoryQuestionsContainer = document.getElementById("category-questions");

            // Study Plans Section
            const studyPlansContainer = document.getElementById("study-plans");

            // Extra Stats Section
            const totalProblemsEl = document.getElementById("total-problems");
            const avgTimeEl = document.getElementById("avg-time");
            const dailyTargetEl = document.getElementById("daily-target");

            // 1. Populate company filter dynamically
            if (companySelect && data.problems) {
                companySelect.innerHTML = `<option value="All">All Companies</option>`;
                
                // Get all unique companies from problems
                const allCompanies = new Set();
                data.problems.forEach(problem => {
                    if (problem.companies) {
                        problem.companies.forEach(company => allCompanies.add(company));
                    }
                });
                
                // Sort companies alphabetically and add to dropdown
                Array.from(allCompanies).sort().forEach(company => {
                    const option = document.createElement("option");
                    option.value = company;
                    option.textContent = company;
                    companySelect.appendChild(option);
                });
            }

            // 2. Populate category filter dynamically
            if (categorySelect && data.problems) {
                const categories = Array.from(new Set(data.problems.map(p => p.category)));
                categorySelect.innerHTML = `<option value="All">All Categories</option>`;
                categories.forEach(category => {
                    const option = document.createElement("option");
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            }

            // 3. Populate Study Plans
            if (studyPlansContainer && data.studyPlans) {
                studyPlansContainer.innerHTML = "";
                Object.entries(data.studyPlans).forEach(([key, plan]) => {
                    const planDiv = document.createElement("div");
                    planDiv.className = "plan-item";
                    planDiv.innerHTML = `
                        <h3>${plan.name}</h3>
                        <p><strong>Duration:</strong> ${plan.duration}</p>
                        <p><strong>Problems per day:</strong> ${plan.problemsPerDay}</p>
                        <p><strong>Focus Areas:</strong> ${plan.focusAreas.join(", ")}</p>
                        <p><strong>Total Problems:</strong> ${plan.problems.length}</p>
                    `;
                    studyPlansContainer.appendChild(planDiv);
                });
            }

            // 4. Populate Extra Stats
            if (data.stats) {
                if (totalProblemsEl) totalProblemsEl.textContent = data.problems ? data.problems.length : "0";
                if (avgTimeEl) avgTimeEl.textContent = data.stats.averageTimePerProblem || "--";
                if (dailyTargetEl) dailyTargetEl.textContent = `${data.stats.recommendedDailyTarget} problems` || "--";
            }

            // Helper: render questions
            function renderQuestions(problemIds, container) {
                if (!container) return;
                
                container.innerHTML = "";
                if (!problemIds || problemIds.length === 0) {
                    container.innerHTML = "<p>No questions found.</p>";
                    return;
                }
                
                problemIds.forEach(id => {
                    const problem = data.problems.find(p => p.id === id);
                    if (problem) {
                        const card = document.createElement("div");
                        card.className = "question-item";
                        card.innerHTML = `
                            <a href="${problem.leetcodeUrl}" target="_blank">${problem.title}</a>
                            <p><strong>Difficulty:</strong> ${problem.difficulty} | <strong>Category:</strong> ${problem.category}</p>
                            <p><strong>Companies:</strong> ${problem.companies ? problem.companies.join(", ") : "N/A"}</p>
                            <p><strong>Time:</strong> ${problem.estimatedTime || "N/A"}</p>
                        `;
                        container.appendChild(card);
                    }
                });
            }

            // 5. Default render all problems for both sections
            if (data.problems) {
                renderQuestions(data.problems.map(p => p.id), companyQuestionsContainer);
                renderQuestions(data.problems.map(p => p.id), categoryQuestionsContainer);
            }

            // 6. On company selection change
            if (companySelect) {
                companySelect.addEventListener("change", e => {
                    const company = e.target.value;
                    if (company === "All") {
                        renderQuestions(data.problems.map(p => p.id), companyQuestionsContainer);
                    } else {
                        // Filter problems that include the selected company
                        const filteredProblems = data.problems.filter(problem => 
                            problem.companies && problem.companies.includes(company)
                        ).map(p => p.id);
                        renderQuestions(filteredProblems, companyQuestionsContainer);
                    }
                });
            }

            // 7. On category selection change
            if (categorySelect) {
                categorySelect.addEventListener("change", e => {
                    const category = e.target.value;
                    if (category === "All") {
                        renderQuestions(data.problems.map(p => p.id), categoryQuestionsContainer);
                    } else {
                        const ids = data.problems.filter(p => p.category === category).map(p => p.id);
                        renderQuestions(ids, categoryQuestionsContainer);
                    }
                });
            }

        } catch (error) {
            console.error("Error loading questions:", error);
            
            // Show error messages in the containers
            const companyQuestionsContainer = document.getElementById("company-questions");
            const categoryQuestionsContainer = document.getElementById("category-questions");
            const studyPlansContainer = document.getElementById("study-plans");
            
            if (companyQuestionsContainer) {
                companyQuestionsContainer.innerHTML = `<p style="color: #ff6b6b;">Error loading company questions: ${error.message}</p>`;
            }
            if (categoryQuestionsContainer) {
                categoryQuestionsContainer.innerHTML = `<p style="color: #ff6b6b;">Error loading category questions: ${error.message}</p>`;
            }
            if (studyPlansContainer) {
                studyPlansContainer.innerHTML = `<p style="color: #ff6b6b;">Error loading study plans: ${error.message}</p>`;
            }
        }
    }

    // Load questions when DOM is ready
    loadQuestions();
});

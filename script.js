document.addEventListener("DOMContentLoaded", function () {
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

    // validate username
    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
            if (!response.ok) throw new Error("Unable to fetch the User details");

            const data = await response.json();
            console.log("Logging data: ", data);

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
});

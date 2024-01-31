window.addEventListener('load', showLeaderboard);

 async function showLeaderboard() {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get('/premium/leaderboard', {
      headers: { "Authorization": token }
    });
    
    const leaderboardDetails = response.data.leaderboardData; 

    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '<h3 style="margin-left: 4px;">Leaderboard</h3>';
    const ul = document.createElement('ul');
  
    // Iterate through the array of leaderboard details
    leaderboardDetails.forEach((leaderboardItem) => {
      const li = createLeaderboardDetails(leaderboardItem);
      ul.appendChild(li);
    });
  
    // Append the new ul to the existing leaderboard element
    leaderboard.appendChild(ul);
  }

  function createLeaderboardDetails(leaderboardData) {
    const li = document.createElement('li');
    const totalExpense =parseInt(leaderboardData.totalexpenses);
    li.textContent = `Name :${leaderboardData.name} | TotalExpenses: ${totalExpense} `;
    li.classList.add('d-flex');
    
    return li;
    }
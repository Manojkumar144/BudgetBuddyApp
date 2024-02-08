const isPremiumUser = localStorage.getItem('isPremiumUser');
const storedPage = localStorage.getItem('currentPage');
currentPage = storedPage ? parseInt(storedPage) : 1;
let PAGE_SIZE = 5;  

console.log("inside the premium user",isPremiumUser);//dummy
if (isPremiumUser === 'true') {
  // If the user is premium, hide the "Buy Premium" button
  document.getElementById('buyBtn').style.visibility = "hidden";
  // Show the "Leaderboard" button
  document.getElementById('LeaderboardBtn').style.visibility = "visible";

  document.getElementById('downloadBtn').style.visibility = "visible";


} else {
  // If the user is not premium, hide the "Leaderboard" button
  document.getElementById('LeaderboardBtn').style.visibility = "hidden";

  document.getElementById('downloadBtn').style.visibility = "hidden";
  // Show the "Buy Premium" button
  document.getElementById('buyBtn').style.visibility = "visible";
}

async function submitForm(e) {
  const expenseDetails = {
      amount: e.target.amount.value,
      description: e.target.description.value,
      category: e.target.category.value,
  }
  console.log("expense details.....");
  const token = localStorage.getItem('accessToken');

  axios.post('/add-expense',expenseDetails,  { headers: {"Authorization" : token} })
  .then((response) => {
    document.getElementById('amount').value='';
    document.getElementById('description').value='';
    console.log("response from expense...:", response);
    showUserList(response);
  }).catch(err =>{
    console.log(err);
    alert('Failed to submit the form. Please try again.')
  })
}

function showUserList(expenses) {
  console.log("Inside the showUserList...");
  const userListDiv = document.getElementById('userList');
  userListDiv.innerHTML = '';
  const ul = document.createElement('ul');

  // Iterate through the array of expenses
  expenses.forEach((expenseItem) => {
    const li = createListItem(expenseItem);
    ul.appendChild(li);
  });

  // Append the new ul to the existing userListDiv
  userListDiv.appendChild(ul);
}


function createListItem(expense) {
const li = document.createElement('li');
li.textContent = `${expense.amount} - ${expense.description} - ${expense.category}`;
li.classList.add('d-flex');

const editButton = document.createElement('button');
editButton.textContent = 'Edit';
editButton.classList.add('btn', 'btn-primary', 'btn-sm', 'editBtn', 'me-2', 'float-end');
editButton.addEventListener('click', () => editUser(expense.id));

const deleteButton = document.createElement('button');
deleteButton.textContent = 'Delete';
deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'deleteBtn', 'float-end');
deleteButton.addEventListener('click', () => deleteUser(expense.id));

li.appendChild(editButton);
li.appendChild(deleteButton);

return li;
}

function changeItemsPerPage(itemsPerPage) {
  PAGE_SIZE = itemsPerPage; 
  fetchUsers(currentPage, PAGE_SIZE); 
}

async function fetchUsers(page, limit) {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await axios.get(`api/expense?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': token,
      }
    });
    console.log("Inside Fetch Users , response :",response);

     console.log("Inside Fetch Users , totalpages :",response.data.totalPages);
    const expenses = response.data.expenses || [];
    showUserList(expenses);
    updatePaginationControls(response.data.totalPages);
  } catch (err) {
    console.log('Unable to fetch user details', err);
  }
}


async function editUser(expenseId) {
const newAmount = prompt('Enter the new amount:');
const newDescription = prompt('Enter the new description:');
const newCategory = prompt('choose the new category:');

await axios.put(`/api/expense/${expenseId}`,{
  amount: newAmount,
  description: newDescription,
  category: newCategory
}).then(() => {
  fetchUsers();
  console.log('User updated successfully');
}).catch((err)=>{
  console.log('User details did not update properly',err);
})
}

async function deleteUser(expenseId) {
const confirmDelete = confirm('Are you sure you want to delete this record?');
const  token = localStorage.getItem('accessToken');

if (confirmDelete) {

  console.log('expenseId',expenseId);

await axios.delete(`/api/expense/${expenseId}`,
{
   headers: {"Authorization" : token} 
})
.then(()=>{
  fetchUsers();
  console.log('expense record deleted successfully');
})
.catch(err =>{
  console.error('Failed to delete expense record');
})
}
}

document.getElementById('buyBtn').onclick = async function (e) {
  
   const token = localStorage.getItem('accessToken'); 
    const response = await axios.get('/premium',
    {
      headers: {"Authorization" : token}
    });
    console.log('Response...', response)

      var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response) {

          const res =axios.post('/updatetransactionstatus',{
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },{
            headers: {
              "Authorization": token,
            },
          })
          console.log(res);
          alert('You are a premium user now');    
          document.getElementById('buyBtn').style.visibility = "hidden";
          document.getElementById('LeaderboardBtn').style.visibility = "visible";
        }
      };

      const rzpl = new Razorpay(options);
      rzpl.open();
      e.preventDefault();

      rzpl.on('payment.failed', function (response) {
        console.log(response);
        alert('Something went wrong');
      });
  } 

  function handleLeaderboardButtonClick() {
    // Redirect to the leaderboard page
    window.location.href = '/showLeaderBoard';
  }
  
  async function handleDownloadBtnClick() {

    const token =localStorage.getItem('accessToken');
  await axios.get('/download',{
    headers:{
      'Authorization':  token,
    }
  }).then((response)=>{
    if(response.status ===200){
      var a = document.createElement('a');
      a.href=response.data.fileUrl;
      a.download='myexpense.csv';
      a.click();
    }
    else{
      throw new Error(response.data.message);
    }
  })
  .catch(err =>{
    console.log('somwething went wrong in the download expense', err);
  }) 
  }

  window.addEventListener('DOMContentLoaded', () => {
    // Initial fetch with default values
    fetchUsers(currentPage, PAGE_SIZE);

    document.getElementById('pagination').addEventListener('click', (e) => {
        if (e.target.classList.contains('pagination-btn')) {
            const newPage = parseInt(e.target.getAttribute('data-page'));
            if (newPage !== currentPage) {
                currentPage = newPage;
                fetchUsers(currentPage,PAGE_SIZE);
                localStorage.setItem('currentPage', currentPage);
            }
        }
    });
  
    // Event listener for itemsPerPage dropdown
    document.getElementById('itemsPerPageDropdown').addEventListener('change', (e) => {
      const newLimit = parseInt(e.target.value);
      changeItemsPerPage(newLimit);
    });
  });

  function updatePaginationControls(totalPages) {
    let paginationHtml = '';

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
          // Apply inline styles for the active state
          paginationHtml += `<button class="btn pagination-btn active" style="background-color: #ffe3bb; height: 50px; width: 30px;" data-page="${i}">${i}</button>`;
      } else {
          // Apply inline styles for the normal state
          paginationHtml += `<button class="btn pagination-btn" style="height: 30px; width: 30px;" data-page="${i}">${i}</button>`;
      }
    }

    document.getElementById('pagination').innerHTML = paginationHtml;
    const pageButtons = document.querySelectorAll('.pagination-btn');
    pageButtons.forEach(button => {
        button.classList.remove('active');
        if (parseInt(button.getAttribute('data-page')) === currentPage) {
            button.classList.add('active');
        }
    });
}

function handlePagination(e) {
  if (e.target.classList.contains('pagination-btn')) {
      const newPage = parseInt(e.target.getAttribute('data-page'));
      if (newPage !== currentPage) {
          currentPage = newPage;
          fetchAndDisplayExpenses(currentPage);
          localStorage.setItem('currentPage', currentPage);
      }
  }
}
  

const isPremiumUser = localStorage.getItem('isPremiumUser');
 
console.log("inside the premium user",isPremiumUser);//dummy
if (isPremiumUser === 'true') {
  // If the user is premium, hide the "Buy Premium" button
  document.getElementById('buyBtn').style.visibility = "hidden";
  // Show the "Leaderboard" button
  document.getElementById('LeaderboardBtn').style.visibility = "visible";
} else {
  // If the user is not premium, hide the "Leaderboard" button
  document.getElementById('LeaderboardBtn').style.visibility = "hidden";
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

function showUserList(response) {
  console.log("Inside the showUserList...")
const userListDiv = document.getElementById('userList');
userListDiv.innerHTML = '';
const ul = document.createElement('ul');

const expense = response.data.expenses;

  // Iterate through the array of expenses
  expense.forEach((expenseItem) => {
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

async function fetchUsers() {
  const token =localStorage.getItem('accessToken');
  await axios.get('api/expense',{
    headers:{
      'Authorization':  token,
    }
  }).then((expenses)=>{
    showUserList(expenses);
  })
  .catch(err =>{
    console.log('unable to fetch user details', err);
  })
  
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

// Fetch initial user list on page load
fetchUsers();

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

  
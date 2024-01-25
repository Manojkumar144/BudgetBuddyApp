//const Razorpay = require("razorpay");

      async function submitForm() {
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/add-expense', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount, description, category }),
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('amount').value='';
      document.getElementById('description').value='';
      showUserList(result);
    } else {
      alert('Failed to submit the form. Please try again.');
    }
  }

function showUserList(expense) {
  const userListDiv = document.getElementById('userList');
  userListDiv.innerHTML = '';
  const ul = document.createElement('ul');

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
    const response = await fetch('/api/expense',
    {
      headers:{
        'Authorization': `Bearer ${token}`,
      },
    });
    const expenses = await response.json();
    showUserList(expenses);
  }

  async function editUser(expenseId) {
const newAmount = prompt('Enter the new amount:');
const newDescription = prompt('Enter the new description:');
const newCategory = prompt('choose the new category:');

const response = await fetch(`/api/expense/${expenseId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ amount: newAmount, description: newDescription, category: newCategory }),
});

if (response.ok) {
  // Reload the user list after editing
  fetchUsers();
  console.log('User updated successfully');
} else {
  console.error('Failed to update expense record');
}
}

async function deleteUser(expenseId) {
const confirmDelete = confirm('Are you sure you want to delete this record?');

if (confirmDelete) {
  const response = await fetch(`/api/expense/${expenseId}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    // Reload the user list after deletion
    fetchUsers();
    console.log('expense record deleted successfully');
  } else {
    console.error('Failed to delete expense record');
  }
}
}

// Fetch initial user list on page load
  fetchUsers();


  document.getElementById('buyBtn').onclick = async function (e) {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Token', token);
      const response = await fetch('/premium', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Response...', response)
      if (response.ok) {
        const result = await response.json();
        console.log(result);
  
        var options = {
          "key": result.data.key_id,
          "order_id": result.data.order.id,
          "handler": async function (response) {
            await fetch('/updatetransactionstatus', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: { order_id: options.order_id, payment_id: response.payment_id },
            });
            alert('You are a premium user now');
          }
        };
  
        const rzpl = new Razorpay(options);
        rzpl.open();
        e.preventDefault();
  
        rzpl.on('payment.failed', function (response) {
          console.log(response);
        });
      } else {
        console.error(`Failed to fetch premium data. Status: ${response.status}`);
        // Handle non-OK responses here (e.g., show an error message to the user)
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      // Handle unexpected errors here
    }
  };
  

  
  
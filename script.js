const expenseForm = document.getElementById('expense-form');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseList = document.getElementById('expense-list');
const totalAmountSpan = document.getElementById('total-amount');


let savedExpenses = JSON.parse(localStorage.getItem('myExpenses')) || [];
let totalAmount = 0;


// function to display all expenses and update total on the screen
function displayExpenses(){
    // clear the current list and reset total before rebuilding
    expenseList.innerHTML = '';
    totalAmount = 0;

    // Loop through each expense in our saved array
    savedExpenses.forEach(function(expense, index){
        totalAmount +=expense.amount;

        const newListItem = document.createElement('li');
        const expenseText = document.createElement('span');
        expenseText.textContent = `${expense.name} - ₹${expense.amount} ` ;
        
         // create a dynamic delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        //Give it a tiny spacing using style
        deleteButton.style.marginLeft = '10px';
        deleteButton.style.backgroundColor = '#dc3545';


        // add a click event specifically for this delete button
        deleteButton.addEventListener('click' , function(){
           // Remove 1 item from the array at this index
           savedExpenses.splice(index, 1);

           // save the updated array back to browser memory
           localStorage.setItem('myExpenses', JSON.stringify(savedExpenses));

           // Refresh the screen list immediately
           displayExpenses();
        });

        // put text and button inside the list item , then add to the main list
            newListItem.appendChild(expenseText);
            newListItem.appendChild(deleteButton);
            expenseList.appendChild(newListItem);
                
    });

    // update the final total on screen
    totalAmountSpan.textContent = totalAmount;
}


// listing for the form submit event
expenseForm.addEventListener('submit', function(event){
    // preventing default page reload on form submission
    event.preventDefault();

    //Getting the values from the input boxes
    const nameValue = expenseNameInput.value;

    //converting the string input value into a proper JavaScript number
    const amountValue = Number(expenseAmountInput.value);
    
    // create a new expense object
    const newExpense = {
        name: nameValue,
        amount: amountValue
    };

    // push the new object into our memory list array
    savedExpenses.push(newExpense);

    // save the updated list array to browser storage
    localStorage.setItem('myExpenses' , JSON.stringify(savedExpenses));

    // Refresh the screen display
    displayExpenses();
   
    expenseForm.reset();
});

displayExpenses();


window.onpopstate = function(event) {
  console.log(event.state.mailbox);
  showSection(event.state.mailbox);
}

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  //load_mailbox('inbox');

  function compose_email() {
    document.querySelector('#compose-form').onsubmit = ()=>{
        fetch('/emails',{
          method:'POST',
          body: JSON.stringify ({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value,
          })
        })
        .then(response => response.json())
        .then(sent =>{
          console.log(sent);
        })
    return false
    }
    
    
    // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-page').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
});


function load_mailbox(mailbox) {
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(get =>{
    get.forEach(emails => {
      console.log(emails);
      const emailss = emails
      const li = document.createElement('li')
      li.innerHTML = `<div id='emailss'>
                        <p class='sender'>${emailss.sender}</p> 
                        <h3 class='subject'>${emailss.subject}</h3>
                        <p class='timestamp'>${emailss.timestamp}</p>
                      </div>`
      document.querySelector('#emails-view').appendChild(li)
    });
    document.querySelectorAll('#emailss').forEach( div=>{
      div.onclick = ()=>{
    
      document.querySelector('#email-page').style.display = 'block';
      document.querySelector('#emails-view').style.display = 'none';
      console.log(div);
      }
    })
  })
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-page').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


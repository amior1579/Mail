// window.onpopstate = function(event) {
//   console.log(event.state.mailbox);
//   showSection(event.state.mailbox);
// }

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  //load_mailbox('inbox');
  function load_mailbox(mailbox) {
    localStorage.clear()
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(get =>{
      get.forEach(emails => {
        console.log(emails);
        const emailss = emails
        const li = document.createElement('li')
        li.innerHTML = `<div id='div-email'>
                          <p class='id'>${emailss.id}</p> 
                          <p class='sender'>${emailss.sender}</p> 
                          <p class='subject'>${emailss.subject}</p>
                          <p class='sender'>${emailss.body}</p> 
                          <p class='timestamp'>${emailss.timestamp}</p>
                        </div>`
        document.querySelector('#emails-view').appendChild(li);
        
      });
        // document.querySelector('#div-email').click =() => email(emailss.id);
        

      
      

      // document.querySelectorAll('#div-email').forEach( click=>{
      //   click.onclick = (li)=>{
      //     console.log(li);
      //     fetch(`/emails/${id}`)
      //     .then(response => response.json())
      //     .then(page =>{
      //       const div = document.createElement('div')
      //       document.querySelector('#email-page').appendChild(div)
      //       div.innerHTML = `<p>${page.body}</p>`
      //       console.log(page);

      //     })
      //     document.querySelector('#email-page').style.display = 'block';
      //     document.querySelector('#emails-view').style.display = 'none';
      //   }
      // });
    })
      // document.querySelector('li').addEventListener('click', () => email(email_id));
  
  // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#email-page').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
  
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  }


  document.addEventListener('click', event =>{
    const element = event.target
    if(element.className === 'id'){
      console.log(element.innerHTML);
      fetch(`/emails/${element.innerHTML}`)
      .then(response => response.json())
      .then(page =>{
        const div = document.createElement('div')
        document.querySelector('#email-page').appendChild(div)
        div.innerHTML = ` <p>${page.body}</p>
                          <p>${page.sender}</p>
                        `
        console.log(page);
        
      })
      document.querySelector('#email-page').style.display = 'block';
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-page').innerHTML = ''
      
    }
  })

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





  // function email(email_id){
  //   document.querySelector('#email-page').style.display = 'block';
  //   document.querySelector('#emails-view').style.display = 'none';
  //   console.log(email_id);
  //   fetch(`/emails/${email_id}`)
  //   .then(response => response.json())
  //   .then(page =>{
  //     const div = document.createElement('div')
  //     document.querySelector('#email-page').appendChild(div)
  //     div.innerHTML = `<p>${page.body}</p>`
  //     console.log(page);
  //     // console.log(tagid);
  //   })
  // }
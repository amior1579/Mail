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
        const Aclass = document.createAttribute('class')
        Aclass.value = `${emailss.id}`
        li.setAttributeNode(Aclass)
        if(`${mailbox}` === 'inbox' ){
          li.innerHTML =` <div id='div_email'>
                            <p class='id'>${emailss.id}</p> 
                            <p class='sender'>${emailss.sender}</p> 
                            <p class='subject'>${emailss.subject}</p>
                            <p class='timestamp'>${emailss.timestamp}</p>
                            </div>
                            <button class='${emailss.id}'>Archive</button>
                        `
        }else if (`${mailbox}` === 'sent' ) {
          li.innerHTML =` <div id='div_email'>
                            <p class='id'>${emailss.id}</p> 
                            <p class='sender'>${emailss.sender}</p> 
                            <p class='subject'>${emailss.subject}</p>
                            <p class='timestamp'>${emailss.timestamp}</p>
                          </div>
                        `
        }else{
                    li.innerHTML =` <div id='div_email'>
                            <p class='id'>${emailss.id}</p> 
                            <p class='sender'>${emailss.sender}</p> 
                            <p class='subject'>${emailss.subject}</p>
                            <p class='timestamp'>${emailss.timestamp}</p>
                            </div>
                            <button class='${emailss.id}'>Undo</button>
                        `
        }      
        document.querySelector('#emails-view').appendChild(li)
        console.log(emailss.read)
        
        if(`${mailbox}` === 'inbox'){
          if (emailss.read === true){
            const element = document.getElementsByClassName(`${emailss.id}`)
            const li = element[0]
            console.log(li);
            li.style.backgroundColor = '#cccccc'
            console.log(emailss.read === true)
          }
        };

        document.addEventListener('click', event=>{
          const archive = event.target
          console.log(archive);
          
          if(`${mailbox}` === 'inbox'){
            if(archive.className === `${emailss.id}`){
              fetch(`/emails/${emailss.id}`,{
                method:'PUT',
                body: JSON.stringify({
                  archived: true,
                })
              })
              archive.parentElement.style.display = 'none'
            }
          }else{
            if(archive.className === `${emailss.id}`){
              fetch(`/emails/${emailss.id}`,{
                method:'PUT',
                body: JSON.stringify({
                  archived: false,
                })
              })
              archive.parentElement.style.display = 'none'
            }
          }
        })

      }) 
    })
  
  // Show the mailbox and hide other views
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#email-page').style.display = 'none';
  
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
        div.innerHTML = ` <div class='div_single_email'>
                            <p class='singlepage_sender'><span>sender:</span> ${page.sender}</p>
                            <p class='singlepage_recipients'><span>recipients:</span> ${page.recipients}</p>
                            <p class='singlepage_subject'><span>subject:</span> ${page.subject}</p>
                            <p class='singlepage_body'><span>body:</span> ${page.body}</p>
                            <p class='singlepage_timestamp'>${page.timestamp}</p>
                            <button class='replay_button'>Replay</button>
                          </div>
                        `
        fetch(`/emails/${page.id}`,{
          method:'PUT',
          body: JSON.stringify({
            read: true,
          })
        })

        document.addEventListener('click', event=> {
          const replay = event.target
          if(replay.className === 'replay_button'){
            console.log(replay);
            document.querySelector('#compose-form').onsubmit = ()=>{
              fetch('/emails',{
                method:'POST',
                body: JSON.stringify ({
                  recipients: document.querySelector('#compose-recipients').value = `${page.sender}`,
                  sender: document.querySelector('#compose-recipients').value = `${page.recipients}`,
                  subject: document.querySelector('#compose-subject').value,
                  body: document.querySelector('#compose-body').value,
                })
              })
            return false
            }

            document.querySelector('#compose-sender').value = `${page.recipients}`

            document.querySelector('#compose-recipients').value = `${page.sender}`
            const disabled = document.createAttribute('disabled')
            document.querySelector('#compose-recipients').setAttributeNode(disabled)

            document.querySelector('#compose-subject').value = `Re: ${page.subject}`
            const subject = document.createAttribute('disabled')
            document.querySelector('#compose-subject').setAttributeNode(subject)
            
            const date = new Date();
            const senddate = date.toGMTString()
            document.querySelector('#compose-body').value = `«On ${senddate} ${page.sender} wrote:», `



            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#email-page').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'block';
          }

        })
      })

      document.querySelector('#email-page').style.display = 'block';
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-page').innerHTML = '';
      document.querySelector('#compose-view').style.display = 'none';
      
    }
  })


  
  function compose_email() {
    document.querySelector('#success_message').innerHTML = ''
    document.querySelector('#error_message').innerHTML = ''
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
          if(typeof sent.message != 'undefined'){
            document.querySelector('#error_message').innerHTML = ''
            document.querySelector('#success_message').innerHTML = sent.message
            setTimeout(load_mailbox,2000,'sent')

          }if(typeof sent.error != 'undefined'){
            document.querySelector('#success_message').innerHTML = ''
            document.querySelector('#error_message').innerHTML = sent.error
          } 
           
        })
        // Clear out composition fields
        document.querySelector('#compose-recipients').value = '';
        document.querySelector('#compose-subject').value = '';
        document.querySelector('#compose-body').value = '';
    return false
    }
    
    
    // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-page').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  
}
});

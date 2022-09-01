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


  function load_mailbox(mailbox) {
    localStorage.clear()
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(get =>{
      console.log(get);
      get.forEach(emails => {
        console.log(emails);
        const emailss = emails
        const li = document.createElement('li')
        const Aclass = document.createAttribute('class')
        Aclass.value = `${emailss.id}`
        li.setAttributeNode(Aclass)
        if(`${mailbox}` === 'inbox' ){
          li.innerHTML =` <div id='div_inbox'>
                            <p class='id'>${emailss.id}</p> 
                            <p class='sender'>${emailss.sender}</p> 
                            <p class='subject'>${emailss.subject}</p>
                            <p class='timestamp'>${emailss.timestamp}</p>
                            <button class='${emailss.id}'>Archive</button>
                            </div>
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
        
        li.addEventListener('click', ()=> view_email(emailss.id))
        localStorage.clear()

        if(`${mailbox}` === 'inbox' || `${mailbox}` === 'archive'){
          if (emailss.read === true){
            const element = document.getElementsByClassName(`${emailss.id}`)
            const li = element[0]
            console.log(li);
            li.style.backgroundColor = '#cccccc'
            console.log(emailss.read === true)
          }
        };

        // Archive
        document.addEventListener('click', event=>{
          const archive = event.target
          // console.log(archive);
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



  // click to single page
  // document.getElementById('div_inbox').addEventListener('click', emails=>{
  //   console.log(emails);

 
  //       fetch(`/emails/${page.id}`,{
  //         method:'PUT',
  //         body: JSON.stringify({
  //           read: true,
  //         })
  //       })

  //     document.querySelector('#email-page').style.display = 'block';
  //     document.querySelector('#emails-view').style.display = 'none';
  //     document.querySelector('#email-page').innerHTML = '';
  //     document.querySelector('#compose-view').style.display = 'none';
      
    
  // })

  // email single page
  function view_email(emailss_id){
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-page').style.display = 'block';

    console.log(emailss_id);
      fetch(`/emails/${emailss_id}`)
      .then(response => response.json())
      .then(detail =>{
        const div = document.createElement('div')
        document.querySelector('#email-page').appendChild(div)
        div.innerHTML = ` <div class='div_single_email'>
                            <p class='singlepage_sender'><span>sender:</span> ${detail.sender}</p>
                            <p class='singlepage_recipients'><span>recipients:</span> ${detail.recipients}</p>
                            <p class='singlepage_subject'><span>subject:</span> ${detail.subject}</p>
                            <p class='singlepage_body'><span>body:</span> ${detail.body}</p>
                            <p class='singlepage_timestamp'>${detail.timestamp}</p>
                            <button id='replay_button'>Replay</button>
                          </div>
                        `
        document.getElementById('replay_button').addEventListener('click', ()=> replay_email(detail));
        read_email(detail)
        })
      document.querySelector('#email-page').innerHTML = ''
      }


  // replay
  function replay_email(detail){
    console.log(detail);
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-page').style.display = 'none';

    document.querySelector('#compose-recipients').value = `${detail.sender}`
    document.querySelector('#compose-subject').value = `${detail.subject}`
    document.querySelector('#compose-body').value = ''

    const disabled_recipients = document.createAttribute('disabled')
    document.querySelector('#compose-recipients').setAttributeNode(disabled_recipients)
    const disabled_sunbject = document.createAttribute('disabled')
    document.querySelector('#compose-subject').setAttributeNode(disabled_sunbject)
    
    const date = new Date();
    const setddate = date.toGMTString()
    document.querySelector('#compose-body').value = `«On ${setddate} ${detail.sender} wrote:», `

    document.querySelector('#compose-form').onsubmit = ()=>{
      fetch('/emails',{
        method:'POST',
        body: JSON.stringify ({
                sender: (document.querySelector('#compose-sender').value = `${detail.recipients}`),
                recipients: (document.querySelector('#compose-recipients').value = `${detail.sender}`),
                subject: (document.querySelector('#compose-subject').value = `${detail.subject}`),
                body: document.querySelector('#compose-body').value,
        })
        
      })
      .then(response => response.json())
      .then(message =>{
        console.log(message);
      document.querySelector('#error_message').innerHTML = ''
      document.querySelector('#success_message').innerHTML = message.message
      setTimeout(load_mailbox,2000,'sent')
      })
      return false;
    }
    }


  function read_email(detail){
    fetch(`/emails/${detail.id}`,{
      method:'PUT',
      body: JSON.stringify({
        read: true,
      })
    })
  }


  function compose_email() {
    document.querySelector('#success_message').innerHTML = ''
    document.querySelector('#error_message').innerHTML = ''
    
    document.querySelector('#compose-recipients').removeAttribute('disabled')
    document.querySelector('#compose-subject').removeAttribute('disabled')
    document.querySelector('#compose-recipients').value = ''
    document.querySelector('#compose-subject').value = ''
    document.querySelector('#compose-body').value = ''
    
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


document.addEventListener('DOMContentLoaded', function() {

  load_mailbox('inbox')
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  function load_mailbox(mailbox) {
    // localStorage.clear()
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(get =>{
      // console.log(get);
      get.forEach(emails => {
        // console.log(emails);
        const li = document.createElement('li')
        const div = document.createElement('div')
        const createAttribute = document.createAttribute('class')
        createAttribute.value = 'div_show_email'
        div.setAttributeNode(createAttribute)
        div.innerHTML =`<div class='div_sender'>
                          <p class='sender'>${emails.sender}</p> 
                        </div>
                        <div class='div_subject'>
                          <p class='subject'>${emails.subject}</p>
                        </div>
                        <div class='div_timestamp'>    
                          <p class='timestamp'>${emails.timestamp}</p>
                        </div>
                      `          
        li.appendChild(div)
        document.querySelector('#emails-view').appendChild(li)
        // console.log(emails.read)
        


        // click to show email single page
        div.addEventListener('click', ()=> view_email(emails.id,mailbox))



        // read email style
        if(`${mailbox}` === 'inbox' || `${mailbox}` === 'archive'){
          if (emails.read === true){
            li.style.backgroundColor = '#cccccc'
            // console.log(emails.read === true)
          }
        };


        // click email to archive
        const archive_button = document.createElement('button')
        archive_button.id = 'archive'
        if(`${mailbox}` === 'inbox'){
          archive_button.innerHTML = 'Archive'
        }else if(`${mailbox}` === 'archive'){
          archive_button.innerHTML = 'Undo'
        }else{
          archive_button.style.display = 'none'
        }
        li.appendChild(archive_button)
        archive_button.addEventListener('click', ()=> {
          li.style.animationPlayState = 'running';
          li.addEventListener('animationend', () =>  {
            archive_box(emails.id,mailbox,li)
          })
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


  // email single page
  function view_email(emails_id,mailbox){
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-page').style.display = 'block';

    // console.log(emails_id);
      fetch(`/emails/${emails_id}`)
      .then(response => response.json())
      .then(detail =>{
        const div = document.createElement('div')
        document.querySelector('#email-page').appendChild(div)
        div.innerHTML = `
                          <p class='singlepage_sender'><span>sender</span> ${detail.sender}</p>
                          <p class='singlepage_recipients'><span>recipients</span> ${detail.recipients}</p>
                          <p class='singlepage_subject'><span>subject</span> ${detail.subject}</p>
                          <p class='singlepage_body'><span>body</span> ${detail.body}</p>
                          <p class='singlepage_timestamp'>${detail.timestamp}</p>
                          <button id='replay_button'>Replay</button>
                        `
        if(mailbox == 'sent'){
          document.querySelector('#replay_button').style.display= 'none'
        }    
        // click to replay email
        document.getElementById('replay_button').addEventListener('click', ()=> replay_email(detail));
        read_email(detail)
        })
      document.querySelector('#email-page').innerHTML = ''
      }


  // replay email
  function replay_email(detail){
    console.log(detail);
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-page').style.display = 'none';
    document.querySelector('#message').innerHTML = ''
    document.querySelector('#title_compose').innerHTML = 'Replay'
    document.querySelector('#compose-recipients').value = `${detail.sender}`

    const subject_input = document.querySelector('#compose-subject')
    subject_input.value = `${detail.subject}`
    // console.log(subject_input.value);
    if(typeof subject_input.value != `Re: ${detail.subject}`){
      const subject = subject_input.value.replace('Re: ','')
      subject_input.value = subject
      // console.log(subject)
    }

    document.querySelector('#compose-body').value = ''

    const disabled_recipients = document.createAttribute('disabled')
    document.querySelector('#compose-recipients').setAttributeNode(disabled_recipients)
    const disabled_sunbject = document.createAttribute('disabled')
    document.querySelector('#compose-subject').setAttributeNode(disabled_sunbject)
    
    const date = new Date();
    const setddate = date.toGMTString()
    document.querySelector('#compose-body').value = `«On ${setddate} ${detail.recipients} wrote:», `

    document.querySelector('#compose-form').onsubmit = ()=>{
      fetch('/emails',{
        method:'POST',
        body: JSON.stringify ({
                sender: (document.querySelector('#compose-sender').value = `${detail.recipients}`),
                recipients: (document.querySelector('#compose-recipients').value = `${detail.sender}`),
                subject: (document.querySelector('#compose-subject').value = `Re: ${subject_input.value}`),
                body: document.querySelector('#compose-body').value,
        })
      })
      .then(response => response.json())
      .then(message =>{
        console.log(message);
        document.querySelector('#message').innerHTML = message.message
        document.querySelector('#message').style.color= 'green'
        setTimeout(load_mailbox,1000,'sent')
        setTimeout(load_mailbox,1000,'sent')
      })
      return false;
    }
  }


// read email
  function read_email(detail){
    fetch(`/emails/${detail.id}`,{
      method:'PUT',
      body: JSON.stringify({
        read: true,
      })
    })
  }

  // go to archive
  function archive_box(emails_id,mailbox,li){
    // console.log(emails_id);
    li.style.display = 'none'
      if(`${mailbox}` === 'inbox'){
        fetch(`/emails/${emails_id}`,{
          method:'PUT',
          body: JSON.stringify({
            archived: true,
          })
        })
      }else{
        fetch(`/emails/${emails_id}`,{
          method:'PUT',
          body: JSON.stringify({
            archived: false,
          })
        })
      }
      if(mailbox === 'archive'){
        setTimeout(load_mailbox,350,'inbox')
      }
  }

// send email
  function compose_email() {
    document.querySelector('#title_compose').innerHTML = 'New Email'
    document.querySelector('#message').innerHTML = ''
    document.querySelector('#message').innerHTML= ''
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
            document.querySelector('#message').innerHTML = sent.message
            document.querySelector('#message').style.color= 'green'
            setTimeout(load_mailbox,1000,'sent')
          }if(typeof sent.error != 'undefined'){
            document.querySelector('#message').innerHTML = sent.error
            document.querySelector('#message').style.color= 'red'
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


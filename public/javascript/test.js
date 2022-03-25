var sdk = new window.sfdc.BlockSDK({
  blockEditorWidth: 740
});

// Show the zalo type
function toggle(select) {
  document.querySelectorAll('.section').forEach(function(section){
    section.classList.add('hide');
  })
  
  if(select.value)
    document.querySelector(`#${select.value}`).classList.remove('hide');
}

function showResponseOrLink(select) {
  let row = select.dataset.row;
   

  let type = document.querySelector('#types').value; 
  if(type === 'form-list'){ //form-list type
    let linkSelector = '#list-link' + row,
        responseSelector = '#list-response' + row;
    if(select.value === 'button' || select.value === 'text') {
      document.querySelector(responseSelector).classList.remove('hide');
      document.querySelector(linkSelector).classList.add('hide');
    } else if(select.value === 'link') {
      document.querySelector(responseSelector).classList.add('hide');
      document.querySelector(linkSelector).classList.remove('hide');
    }
  }
  else if(type === 'list-button'){ // list button type
    let linkSelector = '#link' + row,
        responseSelector = '#response' + row;
        phoneSelector = '#phone' + row;
        smsSelector = '#sms' + row;

    if(select.value === 'button' || select.value === 'text') {
      document.querySelector(responseSelector).classList.remove('hide');
      document.querySelector(linkSelector).classList.add('hide');
      document.querySelector(phoneSelector).classList.add('hide');
      document.querySelector(smsSelector).classList.add('hide');

    } else if(select.value === 'link') {
      document.querySelector(responseSelector).classList.add('hide');
      document.querySelector(linkSelector).classList.remove('hide');
      document.querySelector(phoneSelector).classList.add('hide');
      document.querySelector(smsSelector).classList.add('hide');

    }
    else if(select.value === 'phone'){
      document.querySelector(responseSelector).classList.add('hide');
      document.querySelector(linkSelector).classList.add('hide');
      document.querySelector(phoneSelector).classList.remove('hide');
      document.querySelector(smsSelector).classList.add('hide');
    }
    else if(select.value === 'sms') {
      document.querySelector(responseSelector).classList.add('hide');
      document.querySelector(linkSelector).classList.add('hide');
      document.querySelector(phoneSelector).classList.remove('hide');
      document.querySelector(smsSelector).classList.remove('hide');
    }
  }
}

function paint(messageType) {
  //console.log('paint:', messageType);
  if(messageType === 'text-area'){
    let content = `<p style="width:300px;margin-left:auto; margin-right:auto;">${document.querySelector('#txtBlock1').value}</p>`;
    sdk.setContent(content);
    sdk.setData({
      'type': messageType,
      'u' : { 
        'txtBlock1': document.querySelector('#txtBlock1').value
      },
      'message':{
        'text': document.querySelector('#txtBlock1').value
      }
    })
  }
  else if(messageType === 'form-photo'){
    let img = '';
    if(document.querySelector('#photos').value)
      img = `<img src="${document.querySelector('#photos').value}" style="width:250px; height:130px;"/>`;

    let content = `<div style="width:300px; margin-left:auto; margin-right:auto">
                  ${img}
                  <div style="padding:5px; background-color:#FFF">${document.querySelector('#txtBlock2').value}</div>
                </div>`;

    sdk.setContent(content);
    sdk.setData({
      'type': messageType,
      'u' : {
        'txtBlock2' : document.querySelector('#txtBlock2').value,
        'photos': document.querySelector('#photos').value
      },
      'message':{
        'text': document.querySelector('#txtBlock2').value,
        'attachment' : {
          'type': 'template',
          'payload': {
            'template_type': 'media',
            'elements': [{
              'media_type': 'image',
              'url' : document.querySelector('#photos').value
            }]
          }
        }
      }
    });
  }
  else if(messageType === 'form-list'){
    let elements = [];
    let contents = [];
    let currentContent = '';
    let ui = [];

    
    document.querySelectorAll('#form-list > div.form-row').forEach( (el, index) => {
      let linkOrButton = el.querySelector('select.selectType').value;
      if(linkOrButton){
        let title = el.querySelector('input.title').value;
        let e = {};
        e.title = title; 
        
        if(linkOrButton === 'link'){
          let url = el.querySelector('input.link').value;
          e.default_action = {
            'type': 'oa.open.url', 
            'url': url
          };
        }
        else if(linkOrButton === 'button') {
          let responseMessage = el.querySelector('input.responseMessage').value;
          e.default_action = {
            'type': 'oa.query.show',
            'payload': responseMessage
          };
        }
        else if(linkOrButton === 'text'){ //only for the first item
          e.default_action = {
            'type': 'oa.query.hide',
            'payload': el.querySelector('input.responseMessage').value
          };
        } 
  
        if(index === 0){
          let subTitle = el.querySelector('input.subTitle').value;
          let bannerImage =  el.querySelector('select.bannerImage').value;
          e.subtitle = subTitle;
          e.image_url = bannerImage; 
          
          currentContent = `<div style="margin-bottom:10px">
                      <div><img src="${bannerImage}" style="width:280px; hieght:200px;" /></div>
                      <div style="margin-top:5px">
                        <span>${title}</span> <br />
                        <span style="color:#A2A4A7;">${subTitle}</span>
                      </div>
                   </div>`;
     
        }
        else {
          let linkImage =  el.querySelector('select.linkImage').value;

          e.image_url = linkImage;
          currentContent = `<div style="padding:15px 5px 15px 70px;border-bottom:1px solid #EBEAE9; background-image: url(\'${linkImage}\');background-position: left center;background-repeat: no-repeat; background-size:40px 40px">
                                ${title}
                            </div>`;
     
        }

        elements.push(e);
        contents.push(currentContent);
 
        //Store the values for UI
        el.querySelectorAll('select, input').forEach( item =>  {
          let obj = { 'id': item.id, 'value': item.value};
          ui.push(obj);
        });
      }
    });

    let content = `<div style="width:300px; margin-left:auto; margin-right:auto; font-weight:600">
                    ${contents.join('')}
                  </div>`; 
    
    sdk.setContent(content);
    sdk.setData({
      'type': messageType,
      'u': ui,
      'message': {
        'attachment' : {
          'type': 'template',
          'payload': {
            'template_type': 'list',
            'elements' : elements
          }
        }
      }
    });

  }
  else if(messageType === 'list-button'){
    let elements = [];
    let contents = [];
    let currentContent = '';
    let ui = [];
    


    document.querySelectorAll('#list-button > div.form-row').forEach( (el, index) => {
      let selectedType = el.querySelector('select.selectType').value;
      if(selectedType){
        let title = el.querySelector('input.title').value;
        let e = {};
        e.title = title; 
        
        if(selectedType === 'link'){
          let url = el.querySelector('input.link').value;
          e.type = 'oa.open.url';
          e.payload =  {
            'url': url
          };
        }
        else if(selectedType === 'button') {
          let responseMessage = el.querySelector('input.responseMessage').value;
          e.type = 'oa.query.show';
          e.payload = responseMessage;
        }
        else if(selectedType === 'phone'){ //only for the first item
          e.type = 'oa.open.phone';
          e.payload = {
              'phone_code' : el.querySelector('input.phone').value
          }
        }
        else if(selectedType === 'sms'){ //only for the first item
          e.type = 'oa.open.sms';
          e.payload = {
              'content' : el.querySelector('input.sms').value,
              'phone_code': el.querySelector('input.phone').value
          }
        } 
        
        currentContent = `<div style="margin-top:4px;padding:5px;border-radius:8px;background-color:#B5BBC0;text-align:center;min-height:18px">${title}</div>`;
       
        elements.push(e);
        contents.push(currentContent);
 
        //Store the values for UI
        el.querySelectorAll('select, input').forEach( item =>  {
          let obj = { 'id': item.id, 'value': item.value};
          ui.push(obj);
        });
      }
    });

    ui.push({'id': 'list-button-message', 'value' : document.querySelector('#list-button-message').value})

    let content = `<div style="width:300px; margin-left:auto; margin-right:auto; font-weight:600">
                    <div style="margin-bottom:10px">${document.querySelector('#list-button-message').value}</div>
                    ${contents.join('')}
                  </div>`; 
    
    sdk.setContent(content);
    sdk.setData({
      'type': messageType,
      'u': ui,
      'message': {
        'text' : document.querySelector('#list-button-message').value,
        'attachment' : {
          'type': 'template',
          'payload': {
            'buttons' : elements
          }
        }
      }
    });
  }
  else if(messageType === 'user-info'){
    let img = '';
    if(document.querySelector('#userInfoImage').value)
      img = `<img src="${document.querySelector('#userInfoImage').value}" style="width:280px; height:130px;"/>`;

    let content = `<div style="width:300px; margin-left:auto; margin-right:auto">
                  ${img}
                  <div style="padding:5px; background-color:#FFF">
                    <span>${document.querySelector('#userInfoTitle').value}</span> <br/>
                    <span style="color:#A2A4A7;">${document.querySelector('#userInfoSubTitle').value}</span>  
                  </div>
                </div>`;

    sdk.setContent(content);
    sdk.setData({
      'type': messageType,
      'u' : {
        'userInfoTitle' : document.querySelector('#userInfoTitle').value,
        'userInfoSubTitle' : document.querySelector('#userInfoSubTitle').value,
        'userInfoImage': document.querySelector('#userInfoImage').value
      },
      'message':{
        'attachment' : {
          'type': 'template',
          'payload': {
            'template_type': 'request_user_info',
            "elements": [{
              "title": document.querySelector('#userInfoTitle').value,
              "subtitle": document.querySelector('#userInfoSubTitle').value,
              "image_url": document.querySelector('#userInfoImage').value
            }]
          }
        }
      }
    });
  }
  else if(messageType === 'notice'){
    const el = document.querySelector('#noticeFile'); 
    let extension = el.options[el.selectedIndex].dataset.extension,
          fileSize = el.options[el.selectedIndex].dataset.size,
          fileName = el.options[el.selectedIndex].text,
          fileId = el.options[el.selectedIndex].dataset.fileId,
          content;

    if(el.value) {
      let bgImage = '';
      if(extension =='pdf'){
        bgImage = 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2056%2064%22%3E%3Cpath%20fill%3D%22%238C181A%22%20d%3D%22m5.1%200c-2.8%200-5.1%202.3-5.1%205.1v53.8c0%202.8%202.3%205.1%205.1%205.1h45.8c2.8%200%205.1-2.3%205.1-5.1v-38.6l-18.9-20.3h-32z%22%3E%3C/path%3E%3Cpath%20fill%3D%22%236B0D12%22%20d%3D%22m56%2020.4v1h-12.8s-6.3-1.3-6.1-6.7c0%200%200.2%205.7%206%205.7h12.9z%22%3E%3C/path%3E%3Cpath%20opacity%3D%22.5%22%20fill%3D%22%23fff%22%20enable-background%3D%22new%22%20d%3D%22m37.1%200v14.6c0%201.7%201.1%205.8%206.1%205.8h12.8l-18.9-20.4z%22%3E%3C/path%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22m14.9%2049h-3.3v4.1c0%200.4-0.3%200.7-0.8%200.7-0.4%200-0.7-0.3-0.7-0.7v-10.2c0-0.6%200.5-1.1%201.1-1.1h3.7c2.4%200%203.8%201.7%203.8%203.6%200%202-1.4%203.6-3.8%203.6z%20m-0.1-5.9h-3.2v4.6h3.2c1.4%200%202.4-0.9%202.4-2.3s-1-2.3-2.4-2.3z%20m10.4%2010.7h-3c-0.6%200-1.1-0.5-1.1-1.1v-9.8c0-0.6%200.5-1.1%201.1-1.1h3c3.7%200%206.2%202.6%206.2%206s-2.4%206-6.2%206z%20m0-10.7h-2.6v9.3h2.6c2.9%200%204.6-2.1%204.6-4.7%200.1-2.5-1.6-4.6-4.6-4.6z%20m16.3%200h-5.8v3.9h5.7c0.4%200%200.6%200.3%200.6%200.7s-0.3%200.6-0.6%200.6h-5.7v4.8c0%200.4-0.3%200.7-0.8%200.7-0.4%200-0.7-0.3-0.7-0.7v-10.2c0-0.6%200.5-1.1%201.1-1.1h6.2c0.4%200%200.6%200.3%200.6%200.7%200.1%200.3-0.2%200.6-0.6%200.6z%22%3E%3C/path%3E%3C/svg%3E")';
      } else if(extension === 'docx') {
        bgImage = 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2056%2064%22%3E%3Cpath%20d%3D%22m5.1%200c-2.8%200-5.1%202.2-5.1%205v53.9c0%202.8%202.3%205.1%205.1%205.1h45.8c2.8%200%205.1-2.3%205.1-5.1v-38.6l-18.9-20.3h-32z%22%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%2314A9DA%22%3E%3C/path%3E%3Cg%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22m56%2020.4v1h-12.8s-6.3-1.3-6.2-6.8c0%200%200.3%205.8%206.1%205.8h12.9z%22%20fill%3D%22%230F93D0%22%3E%3C/path%3E%3Cpath%20d%3D%22m37.1%200v14.6c0%201.6%201.1%205.8%206.1%205.8h12.8l-18.9-20.4z%22%20opacity%3D%22.5%22%20fill%3D%22%23fff%22%3E%3C/path%3E%3C/g%3E%3Cpath%20d%3D%22m14.2%2053.9h-3c-0.6%200-1.1-0.5-1.1-1.1v-9.9c0-0.6%200.5-1%201.1-1h3c3.8%200%206.2%202.6%206.2%206%200%203.4-2.4%206-6.2%206z%20m0-10.7h-2.6v9.3h2.6c3%200%204.7-2.1%204.7-4.6%200-2.6-1.7-4.7-4.7-4.7z%20m14.5%2010.9c-3.6%200-6-2.7-6-6.2s2.4-6.2%206-6.2c3.5%200%205.9%202.6%205.9%206.2%200%203.5-2.4%206.2-5.9%206.2z%20m0-11.1c-2.7%200-4.4%202.1-4.4%204.9%200%202.8%201.7%204.8%204.4%204.8%202.6%200%204.4-2%204.4-4.8%200-2.8-1.8-4.9-4.4-4.9z%20m18.4%200.4c0.1%200.1%200.2%200.3%200.2%200.5%200%200.4-0.3%200.7-0.7%200.7-0.2%200-0.4-0.1-0.5-0.2-0.7-0.9-1.9-1.4-3-1.4-2.6%200-4.6%202-4.6%204.9%200%202.8%202%204.8%204.6%204.8%201.1%200%202.2-0.4%203-1.3%200.1-0.2%200.3-0.3%200.5-0.3%200.4%200%200.7%200.4%200.7%200.8%200%200.2-0.1%200.3-0.2%200.5-0.9%201-2.2%201.7-4%201.7-3.5%200-6.2-2.5-6.2-6.2s2.7-6.2%206.2-6.2c1.8%200%203.1%200.7%204%201.7z%22%20fill%3D%22%23fff%22%3E%3C/path%3E%3C/svg%3E");';
      } else {
        bgImage = 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2056%2064%22%3E%3Cpath%20d%3D%22m5.1%200c-2.8%200-5.1%202.3-5.1%205.1v53.8c0%202.8%202.3%205.1%205.1%205.1h45.8c2.8%200%205.1-2.3%205.1-5.1v-38.6l-18.9-20.3h-32z%22%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%233C8CEA%22%3E%3C/path%3E%3Cpath%20d%3D%22m10.1%2037.4h21.6v2.1h-21.6z%20m0%204.8h21.6v2.1h-21.6z%20m0%204.8h21.6v2.1h-21.6z%20m0%204.8h12.3v2.1h-12.3z%22%20fill%3D%22%23fff%22%3E%3C/path%3E%3Cg%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22m56%2020.4v1h-12.8s-6.4-1.3-6.2-6.7c0%200%200.2%205.7%206%205.7h13z%22%20fill%3D%22%232D6FE4%22%3E%3C/path%3E%3Cpath%20d%3D%22m37.1%200v14.6c0%201.6%201.1%205.8%206.1%205.8h12.8l-18.9-20.4z%22%20opacity%3D%22.5%22%20fill%3D%22%23fff%22%3E%3C/path%3E%3C/g%3E%3C/svg%3E");';
      }

      let style = `<style>
                      div.bg {
                        padding: 10px 10px 10px 90px;height:100px;width:280px;
                        background-repeat:no-repeat;background-position:left center;background-size:80px 80px;
                        background-image:${bgImage};
                        margin-left:auto;
                        margin-right:auto;
                      }
                  </style>`;

      content = `${style}<div class="bg">
                    <div style="margin:10px 0 10px 0">${fileName}</div>
                    <div>${fileSize}</div>
                  </div>`;
    }
    else 
      content = '';

    sdk.setContent(content);
    sdk.setData({
      'type': messageType,
      'fileName': fileName,
      'fileType' : extension,
      'fileSize' : fileSize,
      'fileId' : fileId,
      'u' : {
        'noticeFile': document.querySelector('#noticeFile').value
      },
      'message':{
        'attachment' : {
          'type': 'file',
          'payload': {
            'token' : ''
          }
        }
      }
    });
  }
}

function restoreParms() {
	sdk.getData(function(objData) {
    //console.log('sdk.getData:', JSON.stringify(objData));
  
    let messageType = (objData.type ) ? objData.type : ''; 
    document.getElementById('types').value = messageType;
    document.getElementById('types').onchange();

    if(messageType) {
      if(messageType === 'text-area'){
        document.getElementById('txtBlock1').value = objData.u.txtBlock1;
      }
      else if(messageType === 'form-photo'){
        document.getElementById('txtBlock2').value = objData.u.txtBlock2;
        document.getElementById('photos').value = objData.u.photos;
      }
      else if(messageType === 'form-list'){
        objData.u.forEach((item) =>{
          let el = document.querySelector('#' + item.id);
          el.value = item.value;
          if(el.tagName.toLocaleLowerCase() == 'select' && el.id.startsWith('form-list-type'))
            el.onchange();
        });
      }
      else if(messageType === 'list-button'){
        objData.u.forEach((item) =>{
          let el = document.querySelector('#' + item.id);
          el.value = item.value;
          if(el.tagName.toLocaleLowerCase() == 'select' && el.id.startsWith('list-button-type'))
            el.onchange();
        });
      }
      else if(messageType === 'user-info'){
        document.querySelector('#userInfoTitle').value = objData.u.userInfoTitle;
        document.querySelector('#userInfoSubTitle').value = objData.u.userInfoSubTitle;
        document.querySelector('#userInfoImage').value = objData.u.userInfoImage;
      }
      else if(messageType === 'notice'){
         document.querySelector("#noticeFile").value = objData.u.noticeFile;
      }
    }
	});
}

async function loadResources(url) {
  let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
  });

  return response.json(); 
}

//Capture event on the UI
document.getElementById('workspace').addEventListener("input", function () {
  paint(document.querySelector('#types').value);
});

//Document ready
document.addEventListener('DOMContentLoaded', function(event) {
  const p1 = loadResources('/custom-content-block/getBannerImages');
  const p2 = loadResources('/custom-content-block/getLinkImages'); 
  const p3 = loadResources('/custom-content-block/getFiles')

  Promise.all([p1, p2, p3]).then((values) =>{
    values[0].items.forEach(item => {
      document.querySelectorAll(".bannerImage").forEach(el => {
        const option = document.createElement("option");
        option.text = item.name;
        option.value = item.fileProperties.publishedURL;
        el.add(option);
      });
    });

    values[1].items.forEach(item => {
      document.querySelectorAll(".linkImage").forEach(el => {
        const option = document.createElement("option");
        option.text = item.name;
        option.value = item.fileProperties.publishedURL;
        el.add(option);
      });
    });

    let el = document.querySelector("#noticeFile");
    values[2].items.forEach(item => {
      const option = document.createElement("option");
      option.text = item.name;
      option.value = item.fileProperties.publishedURL;
      option.dataset.size = formatBytes(item.fileProperties.fileSize);
      option.dataset.extension = item.fileProperties.extension;
      option.dataset.fileId = item.id;
      el.add(option);
    });
    restoreParms();
  })
})


function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

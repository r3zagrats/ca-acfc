var sdk = new window.sfdc.BlockSDK(
  [
    'blocktester.herokuapp.com',
    'localhost',
    'mc.s10.exacttarget.com',
    'mc.s10.exacttarget.com/cloud/#app/Content%20Builder/',
    'marketingcloudapps.com',
  ],
  true
);
let normalList;
if (localStorage.getItem('LSNormalList')) {
  normalList = JSON.parse(localStorage.getItem('LSNormalList'));
} else {
  normalList = [
    {
      id: 1,
      title: '',
      subtitle: '',
      image_url: '',
      default_action: '',
      type: '',
      url: '',
      payload: '',
      phone_code: '',
      content: '',
    },
  ];
  localStorage.setItem('LSNormalList', JSON.stringify(normalList));
}
let buttonList;
if (localStorage.getItem('LSButtonList')) {
  buttonList = JSON.parse(localStorage.getItem('LSButtonList'));
} else {
  buttonList = [
    {
      id: 1,
      title: '',
      type: '',
      url: '',
      payload: '',
      content: '',
      phone_code: '',
    },
  ];
  localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
}
// let normalList = [];
// let buttonList = [];
// localStorage.setItem('LSNormalList', JSON.stringify(normalList));
// localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
// console.log(sdk.setBlockEditorWidth);
// sdk.setBlockEditorWidth('800px', console.log(sdk.setBlockEditorWidth));
$('#ccb-form').append('<div class="ccb-form__znsContent-wrapper"></div>');
$('#ccb-form').append('<input id="addNormalList" class="addBtn button" value="Add New Element" />');
$('#ccb-form').append('<input id="addButtonList" class="addBtn button" value="Add New Element" />');
$('#ccb-form').append('<input type="submit" id="submitBtn" class="submitBtn button" value="Submit" />');
$('#submitBtn').hide();
$('#addNormalList').hide();
$('#addButtonList').hide();

$('#ccb-form__znsOptions').on('change', (e) => {
  switch (e.target.value) {
    case 'Default': {
      $('.ccb-form__znsContent-wrapper').empty();
      $('#submitBtn').hide();
      $('#addNormalList').hide();
      $('#addButtonList').hide();
      break;
    }
    case 'Text': {
      $('.ccb-form__znsContent-wrapper').empty();
      $('.ccb-form__znsContent-wrapper').append('<div class="ccb-form__Group"></div>');
      $('.ccb-form__Group').append('<label class="input-label" for="msgText">Message:</label>');
      $('.ccb-form__Group').append(
        '<textarea class="form-input" type="text" id="msgText" name="msgText" maxlength="2000" required placeholder="Enter your message">'
      );
      $('#submitBtn').show();
      $('#addNormalList').hide();
      $('#addButtonList').hide();

      break;
    }
    case 'Image': {
      $('.ccb-form__znsContent-wrapper').empty();
      $('.ccb-form__znsContent-wrapper').append('<div class="ccb-form__Group"></div>');
      $('.ccb-form__Group').append('<label class="input-label" for="msgText">Message:</label>');
      $('.ccb-form__Group').append(
        '<textarea class="form-input" type="text" id="msgText" name="msgText" maxlength="2000" placeholder="Enter your message">'
      );
      $('.ccb-form__Group').append('<label class="input-label" for="imgUrl">Img URL:</label>');
      $('.ccb-form__Group').append(
        '<input class="form-input" type="text" id="imgUrl" name="imgUrl" required placeholder="Enter your Image URL">'
      );
      $('#submitBtn').show();
      $('#addNormalList').hide();
      $('#addButtonList').hide();

      break;
    }
    case 'List': {
      $('.ccb-form__znsContent-wrapper').empty();
      $('.ccb-form__znsContent-wrapper').append('<ul id="elementList"></ul>');
      $('#submitBtn').show();
      $('#addNormalList').show();
      $('#addButtonList').hide();
      RenderList(normalList, false);
      break;
    }
    case 'Buttons': {
      $('.ccb-form__znsContent-wrapper').empty();
      $('.ccb-form__znsContent-wrapper').append(
        '<div id="ccb-form__Group-Button__header" class="ccb-form__Group"></div>'
      );
      $('#ccb-form__Group-Button__header').append(
        '<label class="input-label" for="msgText">Message:</label>'
      );
      $('#ccb-form__Group-Button__header').append(
        '<textarea class="form-input" type="text" id="msgText" name="msgText" maxlength="2000" required placeholder="Enter your message">'
      );
      $('.ccb-form__znsContent-wrapper').append(
        '<div id="ccb-form__Group-Button__body" class="ccb-form__Group"></div>'
      );
      $('#ccb-form__Group-Button__body').append('<ul id="elementList"></ul>');
      $('#submitBtn').show();
      $('#addNormalList').hide();
      $('#addButtonList').show();
      RenderList(buttonList, true);
      break;
    }
  }
});
$('#ccb-form').on('submit', (e) => {
  e.preventDefault();
  const myForm = document.getElementById('ccb-form');
  const formData = new FormData(myForm);
  const formProps = Object.fromEntries(formData);
  sdk.getContent((content) => {
    content = formProps;
    const { znsOptions, msgText, imgUrl } = content;
    switch (znsOptions) {
      case 'Text': {
        console.log(content.msgText);
        const payloadData = `
          { 
            "recipient":{
              "user_id": %%ZaloId%%
            },
            "message":{
              "text": ${JSON.stringify(msgText)}
            }
          }
        `;
        const htmlScript = `
          <div style="background-color: #90caf9; min-height: 100vh; display: flex; padding: 20px">
            <div id="msgBlock" style="
                width: 390px;
                margin: auto;
                border-radius: 5px;
                overflow: hidden;
            ">
              <pre
                style="
                padding: 10px;
                background-color: white;
                border-radius: 5px;
                font-size: 18px;
                margin: auto;
                word-wrap: break-word;
                font-family: inherit;
                white-space: break-spaces;
                "
              >${msgText}
              </pre>
            </div>
          </div>
          <!--Payload ${payloadData} Payload-->
        `;
        sdk.setContent(htmlScript, (setContent) => {
        });
        break;
      }
      case 'Image': {
        console.log(msgText);
        const payloadData = `
          { 
            "recipient": {
              "user_id": %%ZaloId%%
            },
            "message": {
              "text": ${JSON.stringify(msgText)},
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "media",
                  "elements": [{
                    "media_type": "image",
                    "url": "${imgUrl}"
                  }]
                }
              }
            }            
          }
        `;
        let htmlScript
        if (msgText) {
          htmlScript = `
          <div style="background-color: #90caf9; min-height: 100vh; display: flex; padding: 20px">
            <div id="msgBlock" style="
              width: 390px;
              margin: auto;
              border-radius: 5px;
              border-top-right-radius: 5px;
              border-top-left-radius: 5px;
            ">
              <img
                src=${imgUrl}
                alt="msgImage"
                style="
                  width:100%; 
                  height: 232px;
                  border-top-right-radius: 5px;
                  border-top-left-radius: 5px;
                "
              />
              <pre
                style="
                  padding: 10px;
                  margin: 0;
                  margin-bottom: 2px;
                  background-color: white;
                  border-bottom-right-radius: 5px;
                  border-bottom-left-radius: 5px;
                  font-size: 18px;
                  margin-top: -4px;
                  word-wrap: break-word;
                  font-family: inherit;
                  white-space: break-spaces;
                "
              >${msgText}</pre>
            </div>
          </div>
          <!--Payload ${payloadData} Payload-->
        `;
        } else {
          htmlScript = `
          <div style="background-color: #90caf9; min-height: 100vh; display: flex; padding: 20px">
            <div id="msgBlock" style="
              width: 390px;
              margin: auto;
              border-radius: 5px;
              border-top-right-radius: 5px;
              border-top-left-radius: 5px;
            ">
              <img
                src=${imgUrl}
                alt="msgImage"
                style="
                  width:100%; 
                  height: 232px;
                  border-radius: 5px;
                "
              />
            </div>
          </div>
          <!--Payload ${payloadData} Payload-->
        `;
        }
        console.log('htmlScript: ' + htmlScript);
        sdk.setContent(htmlScript, (setContent) => {});
        break;
      }
      case 'List': {
        const result = HandleListInput(formProps);
        console.log(result);
        let htmlScript = `
          <div style="background-color: #90caf9; min-height: 100vh; display: flex; padding: 20px">
            <div
              id="msgBlock"
              style="
                width: 390px;
                margin: auto;
                border-radius: 5px;
                zoom: 80%;
                overflow: hidden
              "
            >
              <img
                src=${formProps.imgUrl1}
                alt="msgImage"
                style="width: 100%; height: 232px;
                "
              />
              <div>
                <div>
                <pre
                  style="
                    padding: 4px;
                    margin: 0;
                    background-color: white;
                    font-size: 18px;
                    margin-top: -4px;
                    word-wrap: break-word;
                    font-family: inherit;
                    white-space: break-spaces;
                  "
                >${formProps.msgTitle1}</pre>
                <pre
                  style="
                    padding: 4px;
                    margin: 0;
                    background-color: white;
                    color: #666;
                    margin-top: -4px;
                    word-wrap: break-word;
                    font-family: inherit;
                    white-space: break-spaces;
                  "
                >${formProps.msgSubTitle1}</pre>
              </div>
        `;
        for (let i = 1; i < result.length; i++) {
          htmlScript += `
            <div
                style="
                display: flex;
                padding: 4px;
                background-color: white;
                border-top: 1px solid #ccc;
              "
            >
            <img
              src=${result[i].image_url}
              style="width: 45px; height: 45px"
            />
            <pre style="flex: 1; padding: 4px; word-wrap: break-word; margin: 0; white-space: break-spaces;">${result[i].title}</pre>
            </div>
          `;
        }
        const payloadData = `
        { 
          "recipient": {
            "user_id": %%ZaloId%%
          },
          "message": {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "list",
                "elements": ${JSON.stringify(result)}
              }
            }
          }
        }
        `;
        htmlScript += `
              </div>
            </div>
          </div>
          <!--Payload ${payloadData} Payload-->
        `;
        console.log('htmlScript: ' + htmlScript);
        sdk.setContent(htmlScript, (setContent) => {});
        break;
      }
      case 'Buttons': {
        const result = HandleButtonListInput(formProps);
        console.log(result);
        let htmlScript = `
          <div style="background-color: #90caf9; min-height: 100vh; display: flex; padding: 20px">
            <div id="msgBlock" style="width: 390px; margin: auto">          
              <pre
                style="
                  padding: 10px;
                  margin: 0;
                  margin-bottom: 2px;
                  background-color: white;
                  font-size: 18px;
                  border-radius: 5px;
                  word-wrap: break-word;
                  font-family: inherit;
                  white-space: break-spaces;
                "
              >${msgText}</pre>
        `;
        result.forEach((el) => {
          htmlScript += `
              <div
                style="
                  padding: 8px;
                  text-align: center;
                  color: white;
                  background-color: gray;
                  border-radius: 5px;
                  margin: 2px 0;
                  border: none;
                "><pre style="font-family: inherit; margin: 0; white-space: break-spaces;">${el.title}</pre></div>
            `;
        });
        const payloadData = `
        {
          "recipient": {
              "user_id": %%ZaloId%%
          },
          "message": {
            "text": ${JSON.stringify(msgText)},
            "attachment": {
              "type": "template",
              "payload": {
                "buttons": ${JSON.stringify(result)}
              }
            }
          }
        }
        `;
        htmlScript += `
            </div>
          </div>
        <!--Payload ${payloadData} Payload-->  
        `;
        console.log('htmlScript: ' + htmlScript);
        sdk.setContent(htmlScript, (setContent) => {});
        break;
      }
    }
  });
});

$('#addNormalList').click(() => {
  normalList = JSON.parse(localStorage.getItem('LSNormalList'));
  if (normalList.length === 5) {
    alert('Một danh sách chỉ có tối đa 5 phần tử');
    return;
  }
  AddNormalListElement(normalList);
  localStorage.setItem('LSNormalList', JSON.stringify(normalList));
  RenderList(normalList, false);
});

$('#addButtonList').click(() => {
  buttonList = JSON.parse(localStorage.getItem('LSButtonList'));
  if (buttonList.length === 5) {
    alert('Một danh sách chỉ có tối đa 5 phần tử');
    return;
  }
  AddButtonListElement(buttonList);
  localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
  RenderList(buttonList, true);
});

const RenderList = (elementList, isButtonList) => {
  console.log('renderList', elementList);
  $('#elementList').empty();
  elementList.forEach((el) => {
    $('#elementList').append(
      `<li id="element${el.id}"><p class="element__header">Element ${el.id}</p></li>`
    );
    $(`#element${el.id}`).append(
      `<div id="ccb-form__Group${el.id}" class="ccb-form__Group"></div>`
    );
    if (el.id !== 1) {
      $(`#element${el.id}`).append(
        `<input id="removeBtn${el.id}" class="removeBtn button" value="Remove" data="el${el.id}" />`
      );
    }
    $(`#ccb-form__Group${el.id}`).append(
      `<label class="input-label" for="msgTitle${el.id}">Title:`
    );
    $(`#ccb-form__Group${el.id}`).append(
      `<textarea class="form-input" type="text" id="msgTitle${el.id}" maxlength="100" required name="msgTitle${el.id}" placeholder="Enter your title">`
    );
    $(`#msgTitle${el.id}`).val(el.title);
    if (isButtonList === false) {
      if (el.id === 1) {
        $(`#ccb-form__Group${el.id}`).append(
          `<label class="input-label" for="msgSubTitle${el.id}">Sub title:</label>`
        );
        $(`#ccb-form__Group${el.id}`).append(
          `<textarea class="form-input" type="text" id="msgSubTitle${el.id}" maxlength="500" required name="msgSubTitle${el.id}" placeholder="Enter your subtitle">`
        );
      }
      $(`#ccb-form__Group${el.id}`).append(
        `<label class="input-label" for="imgUrl${el.id}">Img URL:</label>`
      );
      $(`#ccb-form__Group${el.id}`).append(
        `<input class="form-input" type="text" id="imgUrl${el.id}" name="imgUrl${el.id}" required placeholder="Enter your Image URL">`
      );
    }
    $(`#ccb-form__Group${el.id}`).append(
      `<label class="input-label" for="msgActionTypes${el.id}">Action types:</label>`
    );
    $(`#ccb-form__Group${el.id}`).append(
      `<select name="msgActionTypes${el.id}" id="msgActionTypes${el.id}" required class="ccb-form__Options"></select>`
    );
    const actionTypes = {
      '--Please select one of the action types--': '',
      'Open URL' : 'oa.open.url', 
      'Showing Message' : 'oa.query.show',
      'Hiding Message' : 'oa.query.hide',
      'Sms Text' : 'oa.open.sms', 
      'Phone Call': 'oa.open.phone',
    };
    $.each(actionTypes, (key, value) => {
      $(`#msgActionTypes${el.id}`).append(`<option value="${value}">${key}</option>`);
    });
    $(`#ccb-form__Group${el.id}`).append(
      `<div id="actionTypes${el.id}" class="actionTypes"></div>`
    );
    $(`#msgActionTypes${el.id}`).on('change', (e) => {
      switch (e.target.value) {
        case '' : {
          $(`#actionTypes${el.id}`).empty();
          break;
        }
        case `oa.open.url`: {
          $(`#actionTypes${el.id}`).empty();
          $(`#actionTypes${el.id}`).append(
            `<label class="input-label" for="urlInput${el.id}">URL:</label>`
          );
          $(`#actionTypes${el.id}`).append(
            `<input class="form-input" type="text" id="urlInput${el.id}" required name="urlInput${el.id}" placeholder="Enter your URL">`
          );
          break;
        }
        case `oa.query.show`: {
          $(`#actionTypes${el.id}`).empty();
          $(`#actionTypes${el.id}`).append(
            `<label class="input-label" for="payloadInput${el.id}">Payload:</label>`
          );
          $(`#actionTypes${el.id}`).append(
            `<input class="form-input" type="text" id="payloadInput${el.id}" required maxlength="1000" name="payloadInput${el.id}" placeholder="Enter your Payload">`
          );
          break;
        }
        case `oa.query.hide`: {
          $(`#actionTypes${el.id}`).empty();
          $(`#actionTypes${el.id}`).append(
            `<label class="input-label" for="payloadInput${el.id}">Payload:</label>`
          );
          $(`#actionTypes${el.id}`).append(
            `<input class="form-input" type="text" id="payloadInput${el.id}" required maxlength="1000" name="payloadInput${el.id}" placeholder="Enter your Payload">`
          );
          break;
        }
        case `oa.open.sms`: {
          $(`#actionTypes${el.id}`).empty();
          $(`#actionTypes${el.id}`).append(
            `<label class="input-label" for="smsMsgInput${el.id}">SMS message:</label>`
          );
          $(`#actionTypes${el.id}`).append(
            `<input class="form-input" type="text" id="smsMsgInput${el.id}" maxlength="160" name="smsMsgInput${el.id}" placeholder="Enter your SMS message">`
          );
          $(`#actionTypes${el.id}`).append(
            `<label class="input-label" for="phoneInput${el.id}">Phone number:</label>`
          );
          $(`#actionTypes${el.id}`).append(
            `<input class="form-input" type="tel" id="phoneInput${el.id}" pattern="[0][1-9][0-9]{8}" required name="phoneInput${el.id}" placeholder="Enter the phone number. Format: 0[1-9][0-9]{8}">`
          );
          break;
        }
        case `oa.open.phone`: {
          $(`#actionTypes${el.id}`).empty();
          $(`#actionTypes${el.id}`).append(
            `<label class="input-label" for="phoneInput${el.id}">Phone number:</label>`
          );
          $(`#actionTypes${el.id}`).append(
            `<input class="form-input" type="tel" id="phoneInput${el.id}" pattern="[0][1-9][0-9]{8}" required name="phoneInput${el.id}" placeholder="Enter the phone number. Format: 0[1-9][0-9]{8}">`
          );
          break;
        }
      }
    });
    if (isButtonList === false) {
      $(`#removeBtn${el.id}`).click(() => {
        normalList = JSON.parse(localStorage.getItem('LSNormalList'));
        normalList = RemoveElement(normalList, el.id);
        RenderList(normalList, false);
        localStorage.setItem('LSNormalList', JSON.stringify(normalList));
      });
    } else {
      $(`#removeBtn${el.id}`).click(() => {
        buttonList = JSON.parse(localStorage.getItem('LSButtonList'));
        buttonList = RemoveElement(buttonList, el.id);
        RenderList(buttonList);
        localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
      });
    }
  });
};

const AddNormalListElement = (elementList) => {
  const newElement = {
    id: elementList.length + 1,
    title: '',
    image_url: '',
    default_action: '',
    type: '',
    url: '',
    payload: '',
    phone_code: '',
    content: '',
  };
  elementList.push(newElement);
};

const AddButtonListElement = (elementList) => {
  const newElement = {
    id: elementList.length + 1,
    title: '',
    type: '',
    url: '',
    payload: '',
    content: '',
    phone_code: '',
  };
  elementList.push(newElement);
};

const RemoveElement = (elementList, id) => {
  elementList = elementList.filter((element) => {
    return element.id !== id;
  });
  for (let i = id - 1; i < elementList.length; i++) {
    elementList[i].id--;
  }
  return elementList;
};

const HandleListInput = (input) => {
  console.log('input: ', input);
  const result = [];
  for (let i = 1; i < 6; i++) {
    const element = {};
    for (let [key, value] of Object.entries(input)) {
      const regex = new RegExp(`.*${i}`);
      if (regex.test(key)) {
        if (key.includes('Type')) key = 'type';
        else if (key.includes('img')) {
          key = 'image_url';
        } else if (key.includes('msgTitle')) key = 'title';
        else if (key.includes('SubTitle')) key = 'subtitle';
        element[key] = value;
      }
    }
    result.push(element);
  }
  for (let el of result) {
    switch (el.type) {
      case 'oa.open.url': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('urlInput')) {
            const temp = value;
            el['url'] = temp;
            delete el[key];
          }
        }
        el['default_action'] = {
          type: el['type'],
          url: el['url'],
        };
        delete el['type'];
        delete el['url'];
        break;
      }
      case 'oa.query.show': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('payload')) {
            const temp = value;
            el['payload'] = temp;
            delete el[key];
          }
        }
        el['default_action'] = {
          type: el['type'],
          payload: el['payload'],
        };
        delete el['type'];
        delete el['payload'];
        break;
      }
      case 'oa.query.hide': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('payload')) {
            const temp = value;
            el['payload'] = temp;
            delete el[key];
          }
        }
        el['default_action'] = {
          type: el['type'],
          payload: el['payload'],
        };
        delete el['type'];
        delete el['payload'];
        break;
      }
      case 'oa.open.sms': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('sms')) {
            const temp = { content: value };
            el['payload'] = temp;
            delete el[key];
          }
          if (key.includes('phone')) {
            const temp = value;
            el['payload'] = {
              ...el['payload'],
              phone_code: temp,
            };
            delete el[key];
          }
        }
        el['default_action'] = {
          type: el['type'],
          payload: el['payload'],
        };
        delete el['type'];
        delete el['payload'];
        break;
      }
      case 'oa.open.phone': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('phone')) {
            const temp = { phone_code: value };
            el['payload'] = temp;
            delete el[key];
          }
        }
        el['default_action'] = {
          type: el['type'],
          payload: el['payload'],
        };
        delete el['type'];
        delete el['payload'];
        break;
      }
    }
  }
  return result.filter((el) => {
    return el.title;
  });
};

const HandleButtonListInput = (input) => {
  const result = [];
  for (let i = 1; i < 6; i++) {
    const element = {};
    for (let [key, value] of Object.entries(input)) {
      const regex = new RegExp(`.*${i}`);
      if (regex.test(key)) {
        if (key.includes('Type')) key = 'type';
        else if (key.includes('Title')) key = 'title';
        element[key] = value;
      }
    }
    result.push(element);
  }
  for (let el of result) {
    switch (el.type) {
      case 'oa.open.url': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('url')) {
            const temp = { url: value };
            el['payload'] = temp;
            delete el[key];
          }
        }
        break;
      }
      case 'oa.query.show': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('payload')) {
            const temp = value;
            el['payload'] = temp;
            delete el[key];
          }
        }
        break;
      }
      case 'oa.query.hide': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('payload')) {
            const temp = value;
            el['payload'] = temp;
            delete el[key];
          }
        }
        break;
      }
      case 'oa.open.sms': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('sms')) {
            const temp = { content: value };
            el['payload'] = temp;
            delete el[key];
          }
          if (key.includes('phone')) {
            const temp = value;
            el['payload'] = {
              ...el['payload'],
              phone_code: temp,
            };
            delete el[key];
          }
        }
        break;
      }
      case 'oa.open.phone': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('phone')) {
            const temp = { phone_code: value };
            el['payload'] = temp;
            delete el[key];
          }
        }
        break;
      }
    }
  }
  return result.filter((el) => {
    return el.title;
  });
};

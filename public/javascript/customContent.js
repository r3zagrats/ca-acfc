
//Initiate a new session
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

// Declare temp variables
let normalList = [
  {
    id: 1,
    title: '',
    subTitle: '',
    imageUrl: '',
    actionType: '',
    openUrl: '',
    payload: '',
    smsContent: '',
    phoneCode: '',
  },
];
let buttonList = [
  {
    id: 1,
    title: '',
    actionType: '',
    openUrl: '',
    payload: '',
    smsContent: '',
    phoneCode: '',
  },
]

/**
 * Render Initial UI
 */
const renderInitialUI = () => {
  $('#ccb-form').append('<div class="ccb-form__znsContent-wrapper"></div>');
  $('#ccb-form').append(
    '<input id="addNormalList" class="button slds-button slds-button_brand" value="Add Element" />'
  );
  $('#ccb-form').append(
    '<input id="addButtonList" class="button slds-button slds-button_brand" value="Add Element" />'
  );
  $('#ccb-form').append(
    '<input type="submit" id="submitBtn" class="button submitButton slds-button slds-button_success" value="Submit" />'
  );
  $('#submitBtn').hide();
  $('#addNormalList').hide();
  $('#addButtonList').hide();
};

/**
 * Restore
 */
const restoreData = () => {
  sdk.getData((data) => {
    console.log('data: ', data);
    if(jQuery.isEmptyObject(data)){
      localStorage.setItem('LSNormalList', JSON.stringify(normalList));
      localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
    }
    if (data.type === 'Text') {
      RenderZNSText();
      $('#ccb-znsOptions-select').val(data.type);
      $('#msgText').val(data.text);
    } else if (data.type === 'Image') {
      RenderZNSImage();
      $('#ccb-znsOptions-select').val(data.type);
      $('#msgText').val(data.text);
      $('#imageUrl').val(data.imageUrl);
    } else if (data.type === 'NormalList') {
      console.log('data: ', data);
      $('#ccb-znsOptions-select').val(data.type);
      $('.ccb-form__znsContent-wrapper').append('<ul id="elementList"></ul>');
      $('#submitBtn').show();
      $('#addNormalList').show();
      $('#addButtonList').hide();
      RenderZNSList(data.elements, false);
      normalList = data.elements;
      localStorage.setItem('LSNormalList', JSON.stringify(normalList));
    } else if (data.type === 'ButtonList') {
      $('#ccb-znsOptions-select').val(data.type);
      $('.ccb-form__znsContent-wrapper').append(
        '<div id="ccb-form__Group-Button__header" class="ccb-form__Group"></div>'
      );
      $('#ccb-form__Group-Button__header').append(`
        <div class="slds-form-element" id="ccb-form-msgText-element">
          <label class="slds-form-element__label ccb-label" for="msgText"><abbr class="slds-required" title="required">* </abbr>Message:</label>
          <div class="slds-form-element__control">
          <textarea class="slds-textarea ccb-textarea" type="text" id="msgText" name="msgText" maxlength="2000" placeholder="Enter your message. Maximum length: 2000 "></textarea>
          </div>
        </div>
      `);
      $('.ccb-form__znsContent-wrapper').append(
        '<div id="ccb-form__Group-Button__body" class="ccb-form__Group"></div>'
      );
      $('#ccb-form__Group-Button__body').append('<ul id="elementList"></ul>');
      $('#submitBtn').show();
      $('#addNormalList').hide();
      $('#addButtonList').show();
      RenderZNSList(data.elements, true);
      $('#msgText').val(data.text);
      buttonList = data.elements;
      localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
    }
  });
};

// App running
renderInitialUI();

restoreData();

// DOM events listeners

/** 
 * Listening to ZNS Options changes
 */
$('#ccb-znsOptions-select').on('change', (e) => {
  switch (e.target.value) {
    case 'Default': {
      $('.ccb-form__znsContent-wrapper').empty();
      $('#submitBtn').hide();
      $('#addNormalList').hide();
      $('#addButtonList').hide();
      break;
    }
    case 'Text': {
      RenderZNSText();
      break;
    }
    case 'Image': {
      RenderZNSImage();
      break;
    }
    case 'NormalList': {
      $('.ccb-form__znsContent-wrapper').empty();
      $('.ccb-form__znsContent-wrapper').append('<ul id="elementList"></ul>');
      $('#submitBtn').show();
      $('#addNormalList').show();
      $('#addButtonList').hide();
      RenderZNSList(normalList, false);
      break;
    }
    case 'ButtonList': {
      $('.ccb-form__znsContent-wrapper').empty();
      $('.ccb-form__znsContent-wrapper').append(
        '<div id="ccb-form__Group-Button__header" class="ccb-form__Group"></div>'
      );
      $('#ccb-form__Group-Button__header').append(`
        <div class="slds-form-element" id="ccb-form-msgText-element">
          <label class="slds-form-element__label ccb-label" for="msgText"><abbr class="slds-required" title="required">* </abbr>Message:</label>
          <div class="slds-form-element__control">
          <textarea class="slds-textarea ccb-textarea" type="text" id="msgText" name="msgText" maxlength="2000" placeholder="Enter your message. Maximum length: 2000 "></textarea>
          </div>
        </div>
      `);
      $('.ccb-form__znsContent-wrapper').append(
        '<div id="ccb-form__Group-Button__body" class="ccb-form__Group"></div>'
      );
      $('#ccb-form__Group-Button__body').append('<ul id="elementList"></ul>');
      $('#submitBtn').show();
      $('#addNormalList').hide();
      $('#addButtonList').show();
      RenderZNSList(buttonList, true);
      break;
    }
  }
});

/** 
 * Listening to form keyup events
 */
$('#ccb-form').on('keyup submit', (e) => {
  ReRenderUI();
});

/** 
 * Listening to form submit events
 */
$('#ccb-form').on('submit', (e) => {
  let errorMsg = '';
  let hasError = false;
  e.preventDefault();
  const myForm = document.getElementById('ccb-form');
  const formData = new FormData(myForm);
  const formProps = Object.fromEntries(formData);
  console.log('formProps: ', formProps);
  const { znsOptions, msgText, imageUrl } = formProps;
  switch (znsOptions) {
    case 'Text': {
      $('#ccb-form-msgText-element').removeClass('slds-has-error');
      $('#ccb-form-msgText-element-text-error').remove();
      if (msgText.length === 0) {
        errorMsg = 'This field is required';
        hasError = true;
      }
      if (hasError) {
        $('#ccb-form-msgText-element').addClass('slds-has-error');
        $('#ccb-form-msgText-element').append(
          `<div class="slds-form-element__help" id="ccb-form-msgText-element-text-error">${errorMsg}</div>`
        );
        $('#msgText').on('keydown', (e) => {
          $('#ccb-form-msgText-element').removeClass('slds-has-error');
          $('#ccb-form-msgText-element-text-error').remove();
        });
      }
      break;
    }
    case 'Image': {
      $('#ccb-form-imageUrl-element').removeClass('slds-has-error');
      $('#ccb-form-imageUrl-element-text-error').remove();
      console.log(imageUrl.length);
      if (imageUrl.length === 0) {
        errorMsg = 'This field is required';
        hasError = true;
      }
      if (hasError) {
        $('#ccb-form-imageUrl-element').addClass('slds-has-error');
        $('#ccb-form-imageUrl-element').append(
          `<div class="slds-form-element__help" id="ccb-form-imageUrl-element-text-error">${errorMsg}</div>`
        );
        $('#imageUrl').on('keydown', (e) => {
          $('#ccb-form-imageUrl-element').removeClass('slds-has-error');
          $('#ccb-form-imageUrl-element-text-error').remove();
        });
      }
      break;
    }
    case 'NormalList': {
      hasError = ValidateZNSList(formProps, hasError, errorMsg)
      break;
    }
    case 'ButtonList': {
      hasError = ValidateZNSList(formProps, hasError, errorMsg)
      break;
    }
  }
  if (!hasError) {
    alert('Submit successfully');
  }
});

/**
 * Listening to Add button click
 */
$('#addNormalList').click(() => {
  normalList = JSON.parse(localStorage.getItem('LSNormalList'));
  if (normalList.length === 5) {
    alert('Một danh sách chỉ có tối đa 5 phần tử');
    return;
  }
  AddNormalListElement(normalList);
  localStorage.setItem('LSNormalList', JSON.stringify(normalList));
  RenderZNSList(normalList, false);
});

/**
 * Listening to Add button click
 */
$('#addButtonList').click(() => {
  buttonList = JSON.parse(localStorage.getItem('LSButtonList'));
  if (buttonList.length === 5) {
    alert('Một danh sách chỉ có tối đa 5 phần tử');
    return;
  }
  AddButtonListElement(buttonList);
  localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
  RenderZNSList(buttonList, true);
});

// List processing
/**
 * Add Normal List Element
 * @param {array} elementList 
 */
const AddNormalListElement = (elementList) => {
  const newElement = {
    id: elementList.length + 1,
    title: '',
    imageUrl: '',
    actionType: '',
    url: '',
    payload: '',
    smsContent: '',
    phoneCode: '',
  };
  elementList.push(newElement);
};

/**
 * Add Button List Element
 * @param {array} elementList 
 */
const AddButtonListElement = (elementList) => {
  const newElement = {
    id: elementList.length + 1,
    title: '',
    actionType: '',
    url: '',
    payload: '',
    smsContent: '',
    phoneCode: '',
  };
  elementList.push(newElement);
};

/**
 * Remove Normal/Button List Element
 * @param {array} elementList 
 * @param {number} id 
 * @returns 
 */
const RemoveListElement = (elementList, id) => {
  elementList = elementList.filter((element) => {
    return element.id !== id;
  });
  for (let i = id - 1; i < elementList.length; i++) {
    elementList[i].id--;
  }
  return elementList;
};

//Validate function

/**
 * Validate ZNS Normal/Button List
 * @param {object} formProps 
 * @param {boolean} hasError 
 * @param {string} errorMsg 
 * @returns {string}
 */
const ValidateZNSList = (formProps, hasError, errorMsg) => {
  for (const [key, value] of Object.entries(formProps)) {
    $(`#ccb-form-${key}-element`).removeClass('slds-has-error');
    $(`#ccb-form-${key}-element-text-error`).remove();
  }
  for (const [key, value] of Object.entries(formProps)) {
    if (value.length === 0) {
      hasError = true;
      errorMsg = 'This field is required';
      $(`#ccb-form-${key}-element`).addClass('slds-has-error');
      $(`#ccb-form-${key}-element`).append(
        `<div class="slds-form-element__help" id="ccb-form-${key}-element-text-error">${errorMsg}</div>`
      );
    }
    if (key.includes('actionType')) {
      $(`#${key}`).on('change', (e) => {
        $(`#ccb-form-${key}-element`).removeClass('slds-has-error');
        $(`#ccb-form-${key}-element-text-error`).remove();
      });
    }
    else {
      $(`#${key}`).on('keydown', (e) => {
        $(`#ccb-form-${key}-element`).removeClass('slds-has-error');
        $(`#ccb-form-${key}-element-text-error`).remove();
      });
    }
  }
  return hasError
}

// Handler fucntions

/**
 * Handle ZNS Normal List Input
 * @param {object} input 
 * @returns {array}
 */
const HandleNormalListInput = (input) => {
  const result = [];
  for (let i = 1; i < 6; i++) {
    const element = {};
    for (let [key, value] of Object.entries(input)) {
      const regex = new RegExp(`.*${i}`);
      if (regex.test(key)) {
        if (key.includes('actionType')) key = 'actionType';
        else if (key.includes('image')) {
          key = 'image_url';
        } else if (key.includes('title')) key = 'title';
        else if (key.includes('subTitle')) key = 'subtitle';
        element[key] = value;
      }
    }
    result.push(element);
  }
  for (let el of result) {
    switch (el.actionType) {
      case 'oa.open.url': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('open')) {
            const temp = value;
            el['url'] = temp;
            delete el[key];
          }
        }
        el['default_action'] = {
          type: el['actionType'],
          url: el['url'],
        };
        delete el['actionType'];
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
          type: el['actionType'],
          payload: el['payload'],
        };
        delete el['actionType'];
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
          type: el['actionType'],
          payload: el['payload'],
        };
        delete el['actionType'];
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
          type: el['actionType'],
          payload: el['payload'],
        };
        delete el['actionType'];
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
          type: el['actionType'],
          payload: el['payload'],
        };
        delete el['actionType'];
        delete el['payload'];
        break;
      }
    }
  }
  return result.filter((el) => {
    return el.title;
  });
};

/**
 * Handle ZNS Button List Input
 * @param {object} input 
 * @returns {array}
 */
const HandleButtonListInput = (input) => {
  const result = [];
  for (let i = 1; i < 6; i++) {
    const element = {};
    for (let [key, value] of Object.entries(input)) {
      const regex = new RegExp(`.*${i}`);
      if (regex.test(key)) {
        if (key.includes('actionType')) key = 'type';
        else if (key.includes('title')) key = 'title';
        element[key] = value;
      }
    }
    result.push(element);
  }
  console.log('result between:', result);
  for (let el of result) {
    switch (el.type) {
      case 'oa.open.url': {
        for (let [key, value] of Object.entries(el)) {
          if (key.includes('open')) {
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
  console.log('result: ', result);
  return result.filter((el) => {
    return el.title;
  });
};

/**
 * Rendering 
 */
const ReRenderUI = () => {
  const myForm = document.getElementById('ccb-form');
  const formData = new FormData(myForm);
  const formProps = Object.fromEntries(formData);
  sdk.getContent((content) => {
    content = formProps;
    const { znsOptions, msgText, imageUrl } = content;
    switch (znsOptions) {
      case 'Text': {
        const payloadData = {
          recipient: {
            user_id: '%%ZaloId%%',
          },
          message: {
            text: msgText,
          },
        };
        const htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            <div id="msgBlock" style="width: 390px; margin: auto">
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
              >${msgText}</pre>
            </div>
          </div>
          <!--Payload ${JSON.stringify(payloadData)} Payload-->
        `;
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'Text', text: msgText });
        break;
      }
      case 'Image': {
        const payloadData = {
          recipient: {
            user_id: '%%ZaloId%%',
          },
          message: {
            text: msgText,
            attachment: {
              type: 'template',
              payload: {
                template_type: 'media',
                elements: [
                  {
                    media_type: 'image',
                    url: imageUrl,
                  },
                ],
              },
            },
          },
        };
        let htmlScript;
        if (msgText) {
          htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            <div id="msgBlock" style="
              width: 390px;
              margin: auto;
              border-radius: 5px;
              border-top-right-radius: 5px;
              border-top-left-radius: 5px;
            ">
              <img
                src=${imageUrl}
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
          <!--Payload ${JSON.stringify(payloadData)} Payload-->
        `;
        } else {
          htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            <div id="msgBlock" style="
              width: 390px;
              margin: auto;
              border-radius: 5px;
              border-top-right-radius: 5px;
              border-top-left-radius: 5px;
            ">
              <img
                src=${imageUrl}
                alt="msgImage"
                style="
                  width:100%; 
                  height: 232px;
                  border-radius: 5px;
                "
              />
            </div>
          </div>
          <!--Payload ${JSON.stringify(payloadData)} Payload-->
        `;
        }
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'Image', text: msgText, imageUrl: imageUrl });
        break;
      }
      case 'NormalList': {
        const result = HandleNormalListInput(formProps);
        console.log('formProps', formProps);
        const { imageUrl1, title1, subTitle1 } = formProps;
        let htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
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
                src=${imageUrl1}
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
                >${title1}</pre>
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
                >${subTitle1}</pre>
              </div>
        `;
        for (let i = 1; i < result.length; i++) {
          htmlScript += `
            <div
              style="
                display: flex;
                align-items: center;
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
        console.log('result: ', result);
        for (let i = 0; i < result.length; i++) {
          normalList[i].title = result[i].title ?? '';
          if (i === 0) normalList[i].subTitle = result[i].subtitle ?? '';
          normalList[i].imageUrl = result[i].image_url ?? '';
          normalList[i].actionType = result[i].default_action ? result[i].default_action.type : '';
          normalList[i].openUrl = result[i].default_action ? result[i].default_action.url : '';
          normalList[i].payload =
            result[i].default_action && result[i].default_action.payload !== '[object Object]'
              ? result[i].default_action.payload
              : '';
          normalList[i].smsContent =
            result[i].default_action && result[i].default_action.payload
              ? result[i].default_action.payload.content
              : '';
          normalList[i].phoneCode =
            result[i].default_action && result[i].default_action.payload
              ? result[i].default_action.payload.phone_code
              : '';
        }
        localStorage.setItem('LSNormalList', JSON.stringify(normalList));
        console.log('normalList: ', normalList);
        const payloadData = {
          recipient: {
            user_id: '%%ZaloId%%',
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'list',
                elements: result,
              },
            },
          },
        };
        htmlScript += `
              </div>
            </div>
          </div>
          <!--Payload ${JSON.stringify(payloadData)} Payload-->
        `;
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'NormalList', elements: normalList });
        break;
      }
      case 'ButtonList': {
        console.log('formProps', formProps);
        const result = HandleButtonListInput(formProps);
        console.log(result);
        let htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
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
                "
                ><pre style="font-family: inherit; margin: 0; white-space: break-spaces; word-wrap: break-word;">${el.title}</pre></div>
            `;
        });
        console.log('buttonList: ', buttonList);
        for (let i = 0; i < result.length; i++) {
          buttonList[i].title = result[i].title;
          buttonList[i].actionType = result[i].type;
          buttonList[i].openUrl = result[i].payload ? result[i].payload.url : '';
          buttonList[i].payload =
            result[i].payload && result[i].payload !== '[object Object]' ? result[i].payload : '';
          buttonList[i].smsContent = result[i].payload ? result[i].payload.content : '';
          buttonList[i].phoneCode = result[i].payload ? result[i].payload.phone_code : '';
        }
        console.log('buttonList: ', buttonList);
        localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
        const payloadData = {
          recipient: {
            user_id: '%%ZaloId%%',
          },
          message: {
            text: msgText,
            attachment: {
              type: 'template',
              payload: {
                buttons: result,
              },
            },
          },
        };
        htmlScript += `
            </div>
          </div>
        <!--Payload ${JSON.stringify(payloadData)} Payload-->  
        `;
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'ButtonList', text: msgText, elements: buttonList });
        break;
      }
    }
  });
};

// Render functions
/**
 * Render ZNS Text
 */
const RenderZNSText = () => {
  $('.ccb-form__znsContent-wrapper').empty();
  $('.ccb-form__znsContent-wrapper').append('<div class="ccb-form__Group"></div>');
  $('.ccb-form__Group').append(`
    <div class="slds-form-element" id="ccb-form-msgText-element">
      <label class="slds-form-element__label ccb-label" for="msgText"><abbr class="slds-required" title="required">* </abbr>Message:</label>
      <div class="slds-form-element__control">
        <textarea class="slds-textarea ccb-textarea" type="text" id="msgText" name="msgText" maxlength="2000" placeholder="Enter your message. Maximum length: 2000"></textarea>
      </div>
    </div>
  `);
  $('#submitBtn').show();
  $('#addNormalList').hide();
  $('#addButtonList').hide();
};

/**
 * Render ZNS Image
 */
const RenderZNSImage = () => {
  $('.ccb-form__znsContent-wrapper').empty();
  $('.ccb-form__znsContent-wrapper').append('<div class="ccb-form__Group"></div>');
  $('.ccb-form__Group').append(`
    <div class="slds-form-element" id="ccb-form-msgText-element">
      <label class="slds-form-element__label ccb-label" for="msgText">Message:</label>
      <div class="slds-form-element__control">
        <textarea class="slds-textarea ccb-textarea" type="text" id="msgText" name="msgText" maxlength="2000" placeholder="Enter your message. Maximum length: 2000"></textarea>
      </div>
    </div>
    <div class="slds-form-element" id="ccb-form-imageUrl-element">
      <label class="slds-form-element__label ccb-label" for="imageUrl"><abbr class="slds-required" title="required">* </abbr>Image URL:</label>
      <div class="slds-form-element__control">
        <input class="slds-input ccb-input" type="text" id="imageUrl" name="imageUrl" placeholder="Enter your URL. Maximum size: 1MB, file: png, jpg"">
      </div>
    </div>
  `);
  $('#submitBtn').show();
  $('#addNormalList').hide();
  $('#addButtonList').hide();
};

/**
 * Render ZNS Normal/Button List
 * @param {array} elementList 
 * @param {boolean} isButtonList 
 */
const RenderZNSList = (elementList, isButtonList) => {
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
        `<input id="removeBtn${el.id}" class="button removeButton slds-button slds-button_destructive" value="Remove"/>`
      );
    }
    $(`#ccb-form__Group${el.id}`).append(`
      <div class="slds-form-element" id="ccb-form-title${el.id}-element">
        <label class="slds-form-element__label ccb-label" for="title${el.id}"><abbr class="slds-required" title="required">* </abbr>Title:</label>
        <div class="slds-form-element__control">
          <textarea class="slds-textarea ccb-textarea" type="text" id="title${el.id}" maxlength="100" name="title${el.id}" placeholder="Enter your title. Maximum length: 100"></textarea>
        </div>
      </div>
    `);
    $(`#title${el.id}`).val(el.title);
    if (isButtonList === false) {
      if (el.id === 1) {
        $(`#ccb-form__Group${el.id}`).append(`
          <div class="slds-form-element" id="ccb-form-subTitle${el.id}-element">
            <label class="slds-form-element__label ccb-label" for="subTitle${el.id}"><abbr class="slds-required" title="required">* </abbr>Subtitle:</label>
            <div class="slds-form-element__control">
              <textarea class="slds-textarea ccb-textarea" type="text" id="subTitle${el.id}" maxlength="500" name="subTitle${el.id}" placeholder="Enter your subtitle. Maximum length: 500"></textarea>
            </div>
          </div>
        `);
        $(`#subTitle${el.id}`).val(el.subTitle);
      }
      $(`#ccb-form__Group${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-imageUrl${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="imageUrl${el.id}"><abbr class="slds-required" title="required">* </abbr>Image URL:</label>
          <div class="slds-form-element__control">
            <input class="slds-input ccb-input" type="text" id="imageUrl${el.id}" name="imageUrl${el.id}" placeholder="Enter your URL, file: png, jpg">
          </div>
        </div>
      `);
      $(`#imageUrl${el.id}`).val(el.imageUrl);
    }
    $(`#ccb-form__Group${el.id}`).append(`
      <div class="slds-form-element" id="ccb-form-actionType${el.id}-element">
        <label class="slds-form-element__label ccb-label" for="actionType${el.id}"><abbr class="slds-required" title="required">* </abbr>Action types:</label>
        <div class="slds-form-element__control">
          <select name="actionType${el.id}" id="actionType${el.id}" class="ccb-select slds-select"></select>
        </div>
      </div>
    `);
    const actionType = {
      '--Select one of the following options--': '',
      'Open URL': 'oa.open.url',
      'Send Displayed Message': 'oa.query.show',
      'Send Hidden Message': 'oa.query.hide',
      'Send Sms Message': 'oa.open.sms',
      'Make Phone Call': 'oa.open.phone',
    };
    $.each(actionType, (key, value) => {
      $(`#actionType${el.id}`).append(`<option value=${value}>${key}</option>`);
    });
    $(`#ccb-form__Group${el.id}`).append(
      `<div id="actionTypeContent${el.id}" class="actionTypeContent"></div>`
    );
    $(`#actionType${el.id}`).val(el.actionType);
    RenderActionTypes(el, el.actionType);
    $(`#actionType${el.id}`).on('change', (e) => {
      RenderActionTypes(el, e.target.value);
    });

    if (isButtonList === false) {
      $(`#removeBtn${el.id}`).click(() => {
        normalList = JSON.parse(localStorage.getItem('LSNormalList'));
        normalList = RemoveListElement(normalList, el.id);
        localStorage.setItem('LSNormalList', JSON.stringify(normalList));
        RenderZNSList(normalList, false);
        ReRenderUI();
      });
    } else {
      $(`#removeBtn${el.id}`).click(() => {
        buttonList = JSON.parse(localStorage.getItem('LSButtonList'));
        buttonList = RemoveListElement(buttonList, el.id);
        localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
        RenderZNSList(buttonList);
        ReRenderUI();
      });
    }
  });
};

/**
 * Render ZNS Action Types
 * @param {object} el 
 * @param {string} type 
 */
const RenderActionTypes = (el, type) => {
  switch (type) {
    case '': {
      $(`#actionTypeContent${el.id}`).empty();
      break;
    }
    case `oa.open.url`: {
      $(`#actionTypeContent${el.id}`).empty();
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-openUrl${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="openUrl${el.id}"><abbr class="slds-required" title="required">* </abbr>URL:</label>
          <div class="slds-form-element__control">
            <input class="slds-input ccb-input" type="text" id="openUrl${el.id}" name="openUrl${el.id}" placeholder="Enter your URL">
          </div>
        </div>
      `);
      $(`#openUrl${el.id}`).val(el.openUrl);
      break;
    }
    case `oa.query.show`: {
      console.log('el.payload: ', el, el.payload);
      $(`#actionTypeContent${el.id}`).empty();
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-payload${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="payload${el.id}"><abbr class="slds-required" title="required">* </abbr>Payload:</label>
          <div class="slds-form-element__control">
            <textarea class="slds-input ccb-input" type="text" id="payload${el.id}" maxlength="1000" name="payload${el.id}" placeholder="Enter your payload. Maximum length: 1000"></textarea>
          </div>
        </div>
      `);
      if (typeof el.payload === 'object') {
        $(`#payload${el.id}`).val('');
      } else {
        $(`#payload${el.id}`).val(el.payload);
      }
      break;
    }
    case `oa.query.hide`: {
      $(`#actionTypeContent${el.id}`).empty();
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-payload${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="payload${el.id}"><abbr class="slds-required" title="required">* </abbr>Payload:</label>
          <div class="slds-form-element__control">
            <textarea class="slds-input ccb-input" type="text" id="payload${el.id}" maxlength="1000" name="payload${el.id}" placeholder="Enter your payload. Maximum length: 1000"></textarea>
          </div>
        </div>
      `);
      if (typeof el.payload === 'object') {
        $(`#payload${el.id}`).val('');
      } else {
        $(`#payload${el.id}`).val(el.payload);
      }
      break;
    }
    case `oa.open.sms`: {
      $(`#actionTypeContent${el.id}`).empty();
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-smsContent${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="smsContent${el.id}"><abbr class="slds-required" title="required">* </abbr>SMS message:</label>
          <div class="slds-form-element__control">
            <textarea class="slds-textarea ccb-textarea" type="text" id="smsContent${el.id}" maxlength="160" name="smsContent${el.id}" placeholder="Enter your message. Maximum length: 160"></textarea>
          </div>
        </div>
      `);
      $(`#smsContent${el.id}`).val(el.smsContent);
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-phoneCode${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="phoneCode${el.id}"><abbr class="slds-required" title="required">* </abbr>Phone number:</label>
          <div class="slds-form-element__control">
            <input class="slds-input ccb-input" type="tel" id="phoneCode${el.id}" name="phoneCode${el.id}" placeholder="Enter your phone number">
          </div>
        </div>
      `);
      $(`#phoneCode${el.id}`).val(el.phoneCode);
      break;
    }
    case `oa.open.phone`: {
      $(`#actionTypeContent${el.id}`).empty();
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-phoneCode${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="phoneCode${el.id}"><abbr class="slds-required" title="required">* </abbr>Phone number:</label>
          <div class="slds-form-element__control">
            <input class="slds-input ccb-input" type="tel" id="phoneCode${el.id}" name="phoneCode${el.id}" placeholder="Enter your phone number">
          </div>
        </div>
      `);
      $(`#phoneCode${el.id}`).val(el.phoneCode);
      break;
    }
  }
};

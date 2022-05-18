$(window).ready(onRender);
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
sdk.setBlockEditorWidth('500px');

// Declare temp variables
let normalList = [
  {
    id: 1,
    title: '',
    subTitle: '',
    imageUrl: '',
    imageOption: '',
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
];
let contentBuilderImages = [];
let contentBuilderMetaData = [];

async function onRender() {
  // App running
  $('.ccb-modal').show();
  try {
    const result = await fetchData();
  } catch (error) {
    console.log('error:', error);
  }
  renderInitialUI();
  restoreData();
  $('.ccb-modal').hide();
  // DOM events listeners
  /**
   * Listening to ZM Options changes
   */
  $('#ccb-zmOptions-select').on('change', (e) => {
    $('.ccb-form__zmContent-wrapper').empty();
    switch (e.target.value) {
      case 'Default': {
        $('#submitBtn').hide();
        $('#addNormalList').hide();
        $('#addButtonList').hide();
        break;
      }
      case 'Text': {
        renderZMText();
        break;
      }
      case 'Image': {
        renderZMImage();
        break;
      }
      case 'NormalList': {
        $('.ccb-form__zmContent-wrapper').append('<ul id="elementList"></ul>');
        $('#submitBtn').show();
        $('#addNormalList').show();
        $('#addButtonList').hide();
        renderZMList(normalList, false);
        break;
      }
      case 'ButtonList': {
        $('.ccb-form__zmContent-wrapper').append(
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
        $('.ccb-form__zmContent-wrapper').append(
          '<div id="ccb-form__Group-Button__body" class="ccb-form__Group"></div>'
        );
        $('#ccb-form__Group-Button__body').append('<ul id="elementList"></ul>');
        $('#submitBtn').show();
        $('#addNormalList').hide();
        $('#addButtonList').show();
        renderZMList(buttonList, true);
        break;
      }
      case 'AttachedFile': {
        renderZMAttachedFile();
        break;
      }
      case 'RequestUserInfo': {
        renderZMRequestUserInfo();
        break;
      }
    }
  });

  /**
   * Listening to form keyup events
   */
  $('#ccb-form').on('keyup change submit', (e) => {
    reRenderUI();
  });

  $('.ccb-modal__submitResult-button').on('click', (e) => {
    $('.ccb-modal').hide();
  });

  $('.ccb-modal').on('click', (e) => {
    $('.ccb-modal').hide();
  });

  $('.ccb-modal__submitResult').on('click', (e) => {
    e.stopPropagation();
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
    let { zmOptions, msgText, imageUrl, imageOption, attachedFile, title, subTitle } = formProps;
    switch (zmOptions) {
      case 'Text': {
        $('#ccb-form-msgText-element').removeClass('slds-has-error');
        $('#ccb-form-msgText-element-text-error').remove();
        if (msgText === '') {
          errorMsg = 'This field is required';
          hasError = true;
        }
        if (hasError) {
          $('#ccb-form-msgText-element').addClass('slds-has-error');
          $('#ccb-form-msgText-element').append(
            `<div class="slds-form-element__help ccb-form__error" id="ccb-form-msgText-element-text-error">${errorMsg}</div>`
          );
          $('#msgText').on('keydown', (e) => {
            $('#ccb-form-msgText-element').removeClass('slds-has-error');
            $('#ccb-form-msgText-element-text-error').remove();
          });
        }
        break;
      }
      case 'Image': {
        $('#ccb-form-imageOption-element').removeClass('slds-has-error');
        $('#ccb-form-imageOption-element-text-error').remove();
        $('#ccb-form-imageUrl-element').removeClass('slds-has-error');
        $('#ccb-form-imageUrl-element-text-error').remove();
        if (imageUrl === '') {
          hasError = true;
          errorMsg = 'This field is required';
          $('#ccb-form-imageUrl-element').addClass('slds-has-error');
          $('#ccb-form-imageUrl-element').append(
            `<div class="slds-form-element__help ccb-form__error" id="ccb-form-imageUrl-element-text-error">${errorMsg}</div>`
          );
          $('#imageUrl').on('keydown change', (e) => {
            $('#ccb-form-imageUrl-element').removeClass('slds-has-error');
            $('#ccb-form-imageUrl-element-text-error').remove();
          });
        } else if (imageOption === '') {
          hasError = true;
          errorMsg = 'This field is required';
          $('#ccb-form-imageOption-element').addClass('slds-has-error');
          $('#ccb-form-imageOption-element').append(
            `<div class="slds-form-element__help ccb-form__error" id="ccb-form-imageOption-element-text-error">${errorMsg}</div>`
          );
          $('#imageOption').on('change', (e) => {
            $('#ccb-form-imageOption-element').removeClass('slds-has-error');
            $('#ccb-form-imageOption-element-text-error').remove();
          });
        } else {
          let tmpSize;
          $.each(contentBuilderImages, (i, item) => {
            if (item.fileProperties.publishedURL === imageUrl) {
              tmpSize = item.fileProperties.fileSize;
            }
          });
          if (tmpSize > 1048576) {
            errorMsg = 'File size must be less than 1MB';
            hasError = true;
            $('#ccb-form-imageUrl-element').addClass('slds-has-error');
            $('#ccb-form-imageUrl-element').append(
              `<div class="slds-form-element__help ccb-form__error" id="ccb-form-imageUrl-element-text-error">${errorMsg}</div>`
            );
            $('#imageUrl').on('change', (e) => {
              $('#ccb-form-imageUrl-element').removeClass('slds-has-error');
              $('#ccb-form-imageUrl-element-text-error').remove();
            });
          }
        }
        break;
      }
      case 'NormalList': {
        hasError = validateZMList(formProps, hasError, errorMsg);
        break;
      }
      case 'ButtonList': {
        hasError = validateZMList(formProps, hasError, errorMsg);
        break;
      }
      case 'AttachedFile': {
        $('#ccb-form-attachedFile-element').removeClass('slds-has-error');
        $('#ccb-form-attachedFile-element-text-error').remove();
        if (attachedFile === '') {
          errorMsg = 'This field is required';
          hasError = true;
        } else {
          attachedFile = JSON.parse(attachedFile);
          switch (attachedFile.extension) {
            case 'gif':
            case 'docx':
            case 'pdf': {
              console.log(attachedFile.extension);
              if (attachedFile.size > 5242880) {
                errorMsg = 'File size must be less than 5MB';
                hasError = true;
              }
              break;
            }
            default: {
              errorMsg = 'This file type is not supported';
              hasError = true;
              break;
            }
          }
        }
        if (hasError) {
          $('#ccb-form-attachedFile-element').addClass('slds-has-error');
          $('#ccb-form-attachedFile-element').append(
            `<div class="slds-form-element__help ccb-form__error" id="ccb-form-attachedFile-element-text-error">${errorMsg}</div>`
          );
          $('#attachedFile').on('change', (e) => {
            $('#ccb-form-attachedFile-element').removeClass('slds-has-error');
            $('#ccb-form-attachedFile-element-text-error').remove();
          });
        }
        break;
      }
      case 'RequestUserInfo': {
        $('#ccb-form-title-element').removeClass('slds-has-error');
        $('#ccb-form-title-element-text-error').remove();
        $('#ccb-form-subTitle-element').removeClass('slds-has-error');
        $('#ccb-form-subTitle-element-text-error').remove();
        $('#ccb-form-imageOption-element').removeClass('slds-has-error');
        $('#ccb-form-imageOption-element-text-error').remove();
        $('#ccb-form-imageUrl-element').removeClass('slds-has-error');
        $('#ccb-form-imageUrl-element-text-error').remove();
        if (title === '') {
          errorMsg = 'This field is required';
          hasError = true;
          $('#ccb-form-title-element').addClass('slds-has-error');
          $('#ccb-form-title-element').append(
            `<div class="slds-form-element__help ccb-form__error" id="ccb-form-title-element-text-error">${errorMsg}</div>`
          );
          $('#title').on('keydown', (e) => {
            $('#ccb-form-title-element').removeClass('slds-has-error');
            $('#ccb-form-title-element-text-error').remove();
          });
        }
        if (subTitle === '') {
          errorMsg = 'This field is required';
          hasError = true;
          $('#ccb-form-subTitle-element').addClass('slds-has-error');
          $('#ccb-form-subTitle-element').append(
            `<div class="slds-form-element__help ccb-form__error" id="ccb-form-subTitle-element-text-error">${errorMsg}</div>`
          );
          $('#subTitle').on('keydown', (e) => {
            $('#ccb-form-subTitle-element').removeClass('slds-has-error');
            $('#ccb-form-subTitle-element-text-error').remove();
          });
        }
        if (imageUrl === '') {
          hasError = true;
          errorMsg = 'This field is required';
          $('#ccb-form-imageUrl-element').addClass('slds-has-error');
          $('#ccb-form-imageUrl-element').append(
            `<div class="slds-form-element__help ccb-form__error" id="ccb-form-imageUrl-element-text-error">${errorMsg}</div>`
          );
          $('#imageUrl').on('keydown change', (e) => {
            $('#ccb-form-imageUrl-element').removeClass('slds-has-error');
            $('#ccb-form-imageUrl-element-text-error').remove();
          });
        } else if (imageOption === '') {
          hasError = true;
          errorMsg = 'This field is required';
          $('#ccb-form-imageOption-element').addClass('slds-has-error');
          $('#ccb-form-imageOption-element').append(
            `<div class="slds-form-element__help ccb-form__error" id="ccb-form-imageOption-element-text-error">${errorMsg}</div>`
          );
          $('#imageOption').on('change', (e) => {
            $('#ccb-form-imageOption-element').removeClass('slds-has-error');
            $('#ccb-form-imageOption-element-text-error').remove();
          });
        } else {
          let tmpSize;
          $.each(contentBuilderImages, (i, item) => {
            if (item.fileProperties.publishedURL === imageUrl) {
              tmpSize = item.fileProperties.fileSize;
            }
          });
          if (tmpSize > 1048576) {
            errorMsg = 'File size must be less than 1MB';
            hasError = true;
            $('#ccb-form-imageUrl-element').addClass('slds-has-error');
            $('#ccb-form-imageUrl-element').append(
              `<div class="slds-form-element__help ccb-form__error" id="ccb-form-imageUrl-element-text-error">${errorMsg}</div>`
            );
            $('#imageUrl').on('change', (e) => {
              $('#ccb-form-imageUrl-element').removeClass('slds-has-error');
              $('#ccb-form-imageUrl-element-text-error').remove();
            });
          }
        }
        break;
      }
    }
    if (!hasError) {
      $('.ccb-modal').show();
      $('.ccb-modal__loading').hide();
      $('.ccb-modal__submitResult.success').show();
      $('.ccb-modal__submitResult.failed').hide();
    } else {
      $('.ccb-modal').show();
      $('.ccb-modal__loading').hide();
      $('.ccb-modal__submitResult.failed').show();
      $('.ccb-modal__submitResult.success').hide();
    }
  });

  $(document).on('change', '#imageOption', (e) => {
    $('#ccb-form-imageUrl-wrapper').empty();
    switch (e.target.value) {
      case 'imageFile': {
        renderImageFiles();
        break;
      }
      case 'imageURL': {
        renderImageUrlInput();
        break;
      }
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
    addNormalListElement(normalList);
    localStorage.setItem('LSNormalList', JSON.stringify(normalList));
    renderZMList(normalList, false);
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
    addButtonListElement(buttonList);
    localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
    renderZMList(buttonList, true);
  });
}

const fetchData = async () => {
  try {
    const imageContent = getImageContent();
    const metaDataContent = getMetaDataContent();
    const [imageList, metaDataList] = await Promise.all([imageContent, metaDataContent]);
    contentBuilderImages = imageList.items;
    contentBuilderMetaData = metaDataList.items;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Render Initial UI
 */
const renderInitialUI = () => {
  $('#ccb-form').append('<div class="ccb-form__zmContent-wrapper"></div>');
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
    if (jQuery.isEmptyObject(data)) {
      localStorage.setItem('LSNormalList', JSON.stringify(normalList));
      localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
    }
    switch (data.type) {
      case 'Text': {
        renderZMText();
        $('#ccb-zmOptions-select').val(data.type);
        $('#msgText').val(data.msgText);
        break;
      }
      case 'Image': {
        renderZMImage();
        $('#ccb-zmOptions-select').val(data.type);
        $('#msgText').val(data.msgText);
        $('#imageOption').val(data.imageOption);
        if (data.imageOption === 'imageFile') {
          renderImageFiles();
        } else if (data.imageOption === 'imageUrl') {
          renderImageUrlInput();
        }
        $('#imageUrl').val(data.imageUrl);
        break;
      }
      case 'NormalList': {
        $('#ccb-zmOptions-select').val(data.type);
        $('.ccb-form__zmContent-wrapper').append('<ul id="elementList"></ul>');
        $('#submitBtn').show();
        $('#addNormalList').show();
        $('#addButtonList').hide();
        renderZMList(data.elements, false);
        normalList = data.elements;
        localStorage.setItem('LSNormalList', JSON.stringify(normalList));
        break;
      }
      case 'ButtonList': {
        $('#ccb-zmOptions-select').val(data.type);
        $('.ccb-form__zmContent-wrapper').append(
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
        $('.ccb-form__zmContent-wrapper').append(
          '<div id="ccb-form__Group-Button__body" class="ccb-form__Group"></div>'
        );
        $('#ccb-form__Group-Button__body').append('<ul id="elementList"></ul>');
        $('#submitBtn').show();
        $('#addNormalList').hide();
        $('#addButtonList').show();
        renderZMList(data.elements, true);
        $('#msgText').val(data.msgText);
        buttonList = data.elements;
        localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
        break;
      }
      case 'AttachedFile': {
        $('#ccb-zmOptions-select').val(data.type);
        renderZMAttachedFile();
        $('#attachedFile').val(JSON.stringify(data.value));
        break;
      }
      case 'RequestUserInfo': {
        renderZMRequestUserInfo();
        $('#ccb-zmOptions-select').val(data.type);
        $('#title').val(data.title);
        $('#subTitle').val(data.subTitle);
        $('#imageOption').val(data.imageOption);
        if (data.imageOption === 'imageFile') {
          renderImageFiles();
        } else if (data.imageOption === 'imageURL') {
          renderImageUrlInput();
        }
        $('#imageUrl').val(data.imageUrl);
        break;
      }
    }
  });
};

// List processing
/**
 * Add Normal List Element
 * @param {array} elementList
 */
const addNormalListElement = (elementList) => {
  const newElement = {
    id: elementList.length + 1,
    title: '',
    imageUrl: '',
    actionType: '',
    imageOption: '',
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
const addButtonListElement = (elementList) => {
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
const removeListElement = (elementList, id) => {
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
 * Validate ZM Normal/Button List
 * @param {object} formProps
 * @param {boolean} hasError
 * @param {string} errorMsg
 * @returns {string}
 */
const validateZMList = (formProps, hasError, errorMsg) => {
  console.log({ formProps, hasError, errorMsg });
  for (const [key, value] of Object.entries(formProps)) {
    $(`#ccb-form-${key}-element`).removeClass('slds-has-error');
    $(`#ccb-form-${key}-element-text-error`).remove();
  }
  for (const [key, value] of Object.entries(formProps)) {
    if (value === '') {
      hasError = true;
      errorMsg = 'This field is required';
      $(`#ccb-form-${key}-element`).addClass('slds-has-error');
      $(`#ccb-form-${key}-element`).append(
        `<div class="slds-form-element__help ccb-form__error" id="ccb-form-${key}-element-text-error">${errorMsg}</div>`
      );
    }
    if (key.includes('actionType')) {
      $(`#${key}`).on('change', (e) => {
        $(`#ccb-form-${key}-element`).removeClass('slds-has-error');
        $(`#ccb-form-${key}-element-text-error`).remove();
      });
    } else if (key.includes('imageUrl')) {
      let tmpSize;
      $.each(contentBuilderImages, (i, item) => {
        if (item.fileProperties.publishedURL === formProps[`${key}`]) {
          tmpSize = item.fileProperties.fileSize;
        }
      });
      if (tmpSize > 1048576) {
        errorMsg = 'File size must be less than 1MB';
        hasError = true;
        $(`#ccb-form-${key}-element`).addClass('slds-has-error');
        $(`#ccb-form-${key}-element`).append(
          `<div class="slds-form-element__help ccb-form__error" id="ccb-form-${key}-element-text-error">${errorMsg}</div>`
        );
        $(`#${key}`).on('change', (e) => {
          $(`#ccb-form-${key}-element`).removeClass('slds-has-error');
          $(`#ccb-form-${key}-element-text-error`).remove();
        });
      }
    } else {
      $(`#${key}`).on('keydown', (e) => {
        $(`#ccb-form-${key}-element`).removeClass('slds-has-error');
        $(`#ccb-form-${key}-element-text-error`).remove();
      });
    }
  }
  return hasError;
};

// Handler fucntions
const handleNormalListInput = (input) => {
  let result = [];
  for (let i = 1; i < 6; i++) {
    const tempPayload = {
      title: input[`title${i}`],
      image_url: input[`imageUrl${i}`],
      imageOption: input[`imageOption${i}`],
      default_action: {
        type: input[`actionType${i}`],
      },
    };
    if (i === 1) tempPayload.subtitle = input.subTitle1;
    switch (input[`actionType${i}`]) {
      case 'oa.open.url': {
        tempPayload.default_action.url = input[`openUrl${i}`];
        break;
      }
      case 'oa.query.show': {
        tempPayload.default_action.payload = input[`payload${i}`];
        break;
      }
      case 'oa.query.hide': {
        tempPayload.default_action.payload = input[`payload${i}`];
        break;
      }
      case 'oa.open.sms': {
        tempPayload.default_action.payload = {};
        tempPayload.default_action.payload.content = input[`smsContent${i}`];
        tempPayload.default_action.payload.phone_code = input[`phoneCode${i}`];
        break;
      }
      case 'oa.open.phone': {
        tempPayload.default_action.payload = {};
        tempPayload.default_action.payload.phone_code = input[`phoneCode${i}`];
        break;
      }
    }
    result.push(tempPayload);
  }
  result = result.filter((el) => {
    return el.title;
  });
  return result;
};

const handleButtonListInput = (input) => {
  let result = [];
  for (let i = 1; i < 6; i++) {
    const tempPayload = {
      title: input[`title${i}`],
      type: input[`actionType${i}`],
    };
    switch (input[`actionType${i}`]) {
      case 'oa.open.url': {
        tempPayload.payload = {};
        tempPayload.payload.url = input[`openUrl${i}`];
        break;
      }
      case 'oa.query.show': {
        tempPayload.payload = input[`payload${i}`];
        break;
      }
      case 'oa.query.hide': {
        tempPayload.payload = input[`payload${i}`];
        break;
      }
      case 'oa.open.sms': {
        tempPayload.payload = {};
        tempPayload.payload.content = input[`smsContent${i}`];
        tempPayload.payload.phone_code = input[`phoneCode${i}`];
        break;
      }
      case 'oa.open.phone': {
        tempPayload.payload = {};
        tempPayload.payload.phone_code = input[`phoneCode${i}`];
        break;
      }
    }
    result.push(tempPayload);
  }
  result = result.filter((el) => {
    return el.title;
  });
  return result;
};
/**
 * Rendering
 */
const reRenderUI = () => {
  const myForm = document.getElementById('ccb-form');
  const formData = new FormData(myForm);
  const formProps = Object.fromEntries(formData);
  sdk.getContent((content) => {
    content = formProps;
    const { zmOptions, msgText, imageUrl, imageOption, attachedFile, title, subTitle } = content;
    switch (zmOptions) {
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
            <div id="msgBlock" style="width: 380px; margin: auto">
              <pre
                style="
                padding: 10px;
                background-color: white;
                border-radius: 5px;
                font-size: 18px;
                margin: auto;
                word-wrap: break-word;
                font-family: serif;
                white-space: break-spaces;
                "
              >${msgText}</pre>
            </div>
          </div>
        `;
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'Text', msgText, payloadData });
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
              width: 380px;
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
                  font-family: serif;
                  white-space: break-spaces;
                "
              >${msgText}</pre>
            </div>
          </div>
        `;
        } else {
          htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            <div id="msgBlock" style="
              width: 380px;
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
        `;
        }
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'Image', msgText, imageUrl, imageOption, payloadData });
        break;
      }
      case 'NormalList': {
        const result = handleNormalListInput(formProps);
        console.log('result', result);
        console.log('formProps', formProps);
        const { imageUrl1, title1, subTitle1 } = formProps;
        let htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            <div
              id="msgBlock"
              style="
                width: 380px;
                margin: auto;
                border-radius: 5px;
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
                    padding: 10px;
                    margin: 0;
                    background-color: white;
                    font-size: 18px;
                    margin-top: -4px;
                    word-wrap: break-word;
                    font-family: serif;
                    white-space: break-spaces;
                  "
                >${title1}</pre>
                <pre
                  style="
                    padding: 0 10px 10px;
                    font-size: 18px;
                    margin: 0;
                    background-color: white;
                    color: #666;
                    margin-top: -4px;
                    word-wrap: break-word;
                    font-family: serif;
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
                padding: 10px;
                background-color: white;
                border-top: 1px solid #ccc;
              "
            >
            <img
              src=${result[i].image_url}
              style="width: 45px; height: 45px"
            />
            <pre 
              style="
                flex: 1;
                font-size:16px;
                font-family: serif;
                padding-left: 10px;
                word-wrap: break-word;
                margin: 0;
                white-space: break-spaces;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2; 
                -webkit-box-orient: vertical;
              ">${result[i].title}</pre>
            </div>
          `;
        }
        console.log('result: ', result);
        for (let i = 0; i < result.length; i++) {
          normalList[i].title = result[i].title ?? '';
          if (i === 0) normalList[i].subTitle = result[i].subtitle ?? '';
          normalList[i].imageUrl = result[i].image_url ?? '';
          normalList[i].imageOption = result[i].imageOption;
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
        `;
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'NormalList', elements: normalList, payloadData });
        break;
      }
      case 'ButtonList': {
        console.log('formProps', formProps);
        const result = handleButtonListInput(formProps);
        console.log(result);
        let htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            <div id="msgBlock" style="width: 380px; margin: auto">          
              <pre
                style="
                  padding: 10px;
                  margin: 0;
                  margin-bottom: 2px;
                  background-color: white;
                  font-size: 18px;
                  border-radius: 5px;
                  word-wrap: break-word;
                  font-family: serif;
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
                ><pre 
                  style="
                    font-family: serif;
                    margin: 0; white-space:
                    break-spaces;
                    word-wrap:break-word;
                ">${el.title}</pre>
              </div>
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
        `;
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'ButtonList', msgText, elements: buttonList, payloadData });
        break;
      }
      case 'AttachedFile': {
        console.log('AttachedFile: ', attachedFile);
        let htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            <div id="msgBlock" style="width: 380px; margin: auto">
        `;
        if (!attachedFile) {
          htmlScript = `
            <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            </div>
          `;
          sdk.setContent(htmlScript);
          break;
        }
        let data = JSON.parse(attachedFile);
        let payloadData = {};
        switch (data.extension) {
          case 'gif': {
            htmlScript += `
                <img
                  src=${data.url}
                  alt="msgImage"
                  style="
                    width:100%; 
                    height: 232px;
                    border-radius: 5px;
                  "
                />
                </div>
              </div>
            `;
            payloadData = {
              recipient: {
                user_id: '%%ZaloId%%',
              },
              message: {
                attachment: {
                  type: 'template',
                  payload: {
                    template_type: 'media',
                    elements: [
                      {
                        media_type: 'gif',
                        attachment_id: '',
                      },
                    ],
                  },
                },
              },
            };
            break;
          }
          case 'docx': {
            htmlScript += `
                <img
                  src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2056%2064%22%3E%3Cpath%20d%3D%22m5.1%200c-2.8%200-5.1%202.2-5.1%205v53.9c0%202.8%202.3%205.1%205.1%205.1h45.8c2.8%200%205.1-2.3%205.1-5.1v-38.6l-18.9-20.3h-32z%22%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%2314A9DA%22%3E%3C/path%3E%3Cg%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22m56%2020.4v1h-12.8s-6.3-1.3-6.2-6.8c0%200%200.3%205.8%206.1%205.8h12.9z%22%20fill%3D%22%230F93D0%22%3E%3C/path%3E%3Cpath%20d%3D%22m37.1%200v14.6c0%201.6%201.1%205.8%206.1%205.8h12.8l-18.9-20.4z%22%20opacity%3D%22.5%22%20fill%3D%22%23fff%22%3E%3C/path%3E%3C/g%3E%3Cpath%20d%3D%22m14.2%2053.9h-3c-0.6%200-1.1-0.5-1.1-1.1v-9.9c0-0.6%200.5-1%201.1-1h3c3.8%200%206.2%202.6%206.2%206%200%203.4-2.4%206-6.2%206z%20m0-10.7h-2.6v9.3h2.6c3%200%204.7-2.1%204.7-4.6%200-2.6-1.7-4.7-4.7-4.7z%20m14.5%2010.9c-3.6%200-6-2.7-6-6.2s2.4-6.2%206-6.2c3.5%200%205.9%202.6%205.9%206.2%200%203.5-2.4%206.2-5.9%206.2z%20m0-11.1c-2.7%200-4.4%202.1-4.4%204.9%200%202.8%201.7%204.8%204.4%204.8%202.6%200%204.4-2%204.4-4.8%200-2.8-1.8-4.9-4.4-4.9z%20m18.4%200.4c0.1%200.1%200.2%200.3%200.2%200.5%200%200.4-0.3%200.7-0.7%200.7-0.2%200-0.4-0.1-0.5-0.2-0.7-0.9-1.9-1.4-3-1.4-2.6%200-4.6%202-4.6%204.9%200%202.8%202%204.8%204.6%204.8%201.1%200%202.2-0.4%203-1.3%200.1-0.2%200.3-0.3%200.5-0.3%200.4%200%200.7%200.4%200.7%200.8%200%200.2-0.1%200.3-0.2%200.5-0.9%201-2.2%201.7-4%201.7-3.5%200-6.2-2.5-6.2-6.2s2.7-6.2%206.2-6.2c1.8%200%203.1%200.7%204%201.7z%22%20fill%3D%22%23fff%22%3E%3C/path%3E%3C/svg%3E"
                  alt="msgImage"
                  style="
                    width:100%; 
                    height: 100px;
                    border-radius: 5px;
                  "
                />
                <p style="text-align:center">${data.name}</p>
                </div>
              </div>
            `;
            payloadData = {
              recipient: {
                user_id: '%%ZaloId%%',
              },
              message: {
                attachment: {
                  type: 'file',
                  payload: {
                    token: '',
                  },
                },
              },
            };
            break;
          }
          case 'pdf': {
            htmlScript += `
                <img
                  src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2056%2064%22%3E%3Cpath%20fill%3D%22%238C181A%22%20d%3D%22m5.1%200c-2.8%200-5.1%202.3-5.1%205.1v53.8c0%202.8%202.3%205.1%205.1%205.1h45.8c2.8%200%205.1-2.3%205.1-5.1v-38.6l-18.9-20.3h-32z%22%3E%3C/path%3E%3Cpath%20fill%3D%22%236B0D12%22%20d%3D%22m56%2020.4v1h-12.8s-6.3-1.3-6.1-6.7c0%200%200.2%205.7%206%205.7h12.9z%22%3E%3C/path%3E%3Cpath%20opacity%3D%22.5%22%20fill%3D%22%23fff%22%20enable-background%3D%22new%22%20d%3D%22m37.1%200v14.6c0%201.7%201.1%205.8%206.1%205.8h12.8l-18.9-20.4z%22%3E%3C/path%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22m14.9%2049h-3.3v4.1c0%200.4-0.3%200.7-0.8%200.7-0.4%200-0.7-0.3-0.7-0.7v-10.2c0-0.6%200.5-1.1%201.1-1.1h3.7c2.4%200%203.8%201.7%203.8%203.6%200%202-1.4%203.6-3.8%203.6z%20m-0.1-5.9h-3.2v4.6h3.2c1.4%200%202.4-0.9%202.4-2.3s-1-2.3-2.4-2.3z%20m10.4%2010.7h-3c-0.6%200-1.1-0.5-1.1-1.1v-9.8c0-0.6%200.5-1.1%201.1-1.1h3c3.7%200%206.2%202.6%206.2%206s-2.4%206-6.2%206z%20m0-10.7h-2.6v9.3h2.6c2.9%200%204.6-2.1%204.6-4.7%200.1-2.5-1.6-4.6-4.6-4.6z%20m16.3%200h-5.8v3.9h5.7c0.4%200%200.6%200.3%200.6%200.7s-0.3%200.6-0.6%200.6h-5.7v4.8c0%200.4-0.3%200.7-0.8%200.7-0.4%200-0.7-0.3-0.7-0.7v-10.2c0-0.6%200.5-1.1%201.1-1.1h6.2c0.4%200%200.6%200.3%200.6%200.7%200.1%200.3-0.2%200.6-0.6%200.6z%22%3E%3C/path%3E%3C/svg%3E"
                  alt="msgImage"
                  style="
                    width:100%; 
                    height: 100px;
                    border-radius: 5px;
                  "
                />
                <p style="text-align:center">${data.name}</p>
                </div>
              </div>
            `;
            payloadData = {
              recipient: {
                user_id: '%%ZaloId%%',
              },
              message: {
                attachment: {
                  type: 'file',
                  payload: {
                    token: '',
                  },
                },
              },
            };
            break;
          }
          default: {
            alert('This type is not supported');
          }
        }
        sdk.setContent(htmlScript);
        sdk.setData({ type: 'AttachedFile', value: data, payloadData });
        break;
      }
      case 'RequestUserInfo': {
        console.log('RequestUserInfo: ', {
          title,
          subTitle,
          imageUrl,
          imageOption,
        });
        const payloadData = {
          recipient: {
            user_id: '%%ZaloId%%',
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'request_user_info',
                elements: [
                  {
                    title: title,
                    subtitle: subTitle,
                    image_url: imageUrl,
                  },
                ],
              },
            },
          },
        };
        let htmlScript = `
          <div style="background-color: #b0c4df; min-height: 96vh; display: flex; padding: 10px; margin: -11px 0 ">
            <div id="msgBlock" style="
              width: 380px;
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
                  font-size: 18px;
                  margin-top: -4px;
                  word-wrap: break-word;
                  font-family: serif;
                  white-space: break-spaces;
                "
              >${title}</pre>
              <pre
                style="
                  padding: 0 10px 10px;
                  font-size: 18px;
                  margin: 0;
                  background-color: white;
                  color: #666;
                  margin-top: -4px;
                  word-wrap: break-word;
                  font-family: serif;
                  white-space: break-spaces;
                  border-bottom-right-radius: 5px;
                  border-bottom-left-radius: 5px;
                "
              >${subTitle}</pre>
            </div>
          </div>
        `;
        sdk.setContent(htmlScript);
        sdk.setData({
          type: 'RequestUserInfo',
          title,
          subTitle,
          imageUrl,
          imageOption,
          payloadData,
        });
        break;
      }
    }
  });
};

// Render functions
/**
 * Render ZM Text
 */
const renderZMText = () => {
  $('.ccb-form__zmContent-wrapper').append(
    '<div id="ccb-form__Group" class="ccb-form__Group"></div>'
  );
  $('#ccb-form__Group').append(`
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

const renderImageUrlInput = (el) => {
  $(`#ccb-form-imageUrl${el ? el.id : ''}-wrapper`).append(`
    <div class="slds-form-element" id="ccb-form-imageUrl${el ? el.id : ''}-element">
      <label class="slds-form-element__label ccb-label" for="imageUrl${
        el ? el.id : ''
      }"><abbr class="slds-required" title="required">* </abbr>Image URL:</label>
      <div class="slds-form-element__control">
        <input class="slds-input ccb-input" type="text" id="imageUrl${
          el ? el.id : ''
        }" name="imageUrl${
    el ? el.id : ''
  }" placeholder="Enter your Image URL. Support type: png, jpg"">
      </div>
    </div>
  `);
  if (el) {
    $(`#imageUrl${el.id}`).val(el.imageUrl);
  }
};

/**
 * Render ZM Image
 */
const renderZMImage = async () => {
  $('.ccb-form__zmContent-wrapper').append(
    '<div id="ccb-form__Group" class="ccb-form__Group"></div>'
  );
  $('#ccb-form__Group').append(`
    <div class="slds-form-element" id="ccb-form-msgText-element">
      <label class="slds-form-element__label ccb-label" for="msgText">Message:</label>
      <div class="slds-form-element__control">
        <textarea class="slds-textarea ccb-textarea" type="text" id="msgText" name="msgText" maxlength="2000" placeholder="Enter your message. Maximum length: 2000"></textarea>
      </div>
    </div>
  `);
  renderImageOptions();
  $('#ccb-form__Group').append(`
    <div id="ccb-form-imageUrl-wrapper"></div>
  `);
  $('#submitBtn').show();
  $('#addNormalList').hide();
  $('#addButtonList').hide();
};

const renderImageOptions = (el) => {
  $(`#ccb-form__Group${el ? el.id : ''}`).append(`
    <div class="slds-form-element" id="ccb-form-imageOption${el ? el.id : ''}-element">
      <label class="slds-form-element__label ccb-label" for="imageOption${
        el ? el.id : ''
      }"><abbr class="slds-required" title="required">* </abbr>Image Option:</label>
      <div class="slds-form-element__control">
        <select class="slds-select ccb-select" id="imageOption${
          el ? el.id : ''
        }" name="imageOption${el ? el.id : ''}">
          <option value="">--Select one of the following options--</option>
          <option value="imageFile">Image File, Maximum size: 1MB</option>
          <option value="imageURL">Image URL, Maximum size: 1MB</option>
        </select>
      </div>
    </div>
  `);
};

/**
 * Render ZM Normal/Button List
 * @param {array} elementList
 * @param {boolean} isButtonList
 */
const renderZMList = (elementList, isButtonList) => {
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
      renderImageOptions(el);
      $(`#imageOption${el.id}`).val(el.imageOption);
      $(`#ccb-form__Group${el.id}`).append(`
        <div id="ccb-form-imageUrl${el.id}-wrapper"></div>
      `);
      $(`#ccb-form-imageUrl${el.id}-wrapper`).empty();
      switch ($(`#imageOption${el.id}`).val()) {
        case 'imageFile': {
          renderImageFiles(el);
          break;
        }
        case 'imageURL': {
          renderImageUrlInput(el);
          break;
        }
      }
      $(`#imageUrl${el.id}`).val(el.imageUrl);
      $(document).on('change', `#imageOption${el.id}`, (e) => {
        $(`#ccb-form-imageUrl${el.id}-wrapper`).empty();
        switch (e.target.value) {
          case 'imageFile': {
            renderImageFiles(el);
            $(`#imageUrl${el.id}`).val('');
            break;
          }
          case 'imageURL': {
            renderImageUrlInput(el);
            $(`#imageUrl${el.id}`).val('');
            break;
          }
        }
      });
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
    renderActionTypes(el, el.actionType);
    $(`#actionType${el.id}`).on('change', (e) => {
      renderActionTypes(el, e.target.value);
    });

    if (isButtonList === false) {
      $(`#removeBtn${el.id}`).click(() => {
        normalList = JSON.parse(localStorage.getItem('LSNormalList'));
        normalList = removeListElement(normalList, el.id);
        localStorage.setItem('LSNormalList', JSON.stringify(normalList));
        renderZMList(normalList, false);
        reRenderUI();
      });
    } else {
      $(`#removeBtn${el.id}`).click(() => {
        buttonList = JSON.parse(localStorage.getItem('LSButtonList'));
        buttonList = removeListElement(buttonList, el.id);
        localStorage.setItem('LSButtonList', JSON.stringify(buttonList));
        renderZMList(buttonList);
        reRenderUI();
      });
    }
  });
};

/**
 * Render ZM Action Types
 * @param {object} el
 * @param {string} type
 */
const renderActionTypes = (el, type) => {
  $(`#actionTypeContent${el.id}`).empty();
  switch (type) {
    case `oa.open.url`: {
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-openUrl${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="openUrl${el.id}"><abbr class="slds-required" title="required">* </abbr>URL:</label>
          <div class="slds-form-element__control">
            <input class="slds-input ccb-input" type="text" id="openUrl${el.id}" name="openUrl${el.id}" placeholder="Enter your Image URL">
          </div>
        </div>
      `);
      $(`#openUrl${el.id}`).val(el.openUrl);
      break;
    }
    case `oa.query.show`: {
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-payload${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="payload${el.id}"><abbr class="slds-required" title="required">* </abbr>Payload:</label>
          <div class="slds-form-element__control">
            <textarea class="slds-input ccb-textarea" type="text" id="payload${el.id}" maxlength="1000" name="payload${el.id}" placeholder="Enter your payload. Maximum length: 1000"></textarea>
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
      $(`#actionTypeContent${el.id}`).append(`
        <div class="slds-form-element" id="ccb-form-payload${el.id}-element">
          <label class="slds-form-element__label ccb-label" for="payload${el.id}"><abbr class="slds-required" title="required">* </abbr>Payload:</label>
          <div class="slds-form-element__control">
            <textarea class="slds-input ccb-textarea" type="text" id="payload${el.id}" maxlength="1000" name="payload${el.id}" placeholder="Enter your payload. Maximum length: 1000"></textarea>
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

const renderImageFiles = (el) => {
  $(`#ccb-form-imageUrl${el ? el.id : ''}-wrapper`).append(`
    <div class="slds-form-element" id="ccb-form-imageUrl${el ? el.id : ''}-element">
      <label class="slds-form-element__label ccb-label" for="imageUrl${
        el ? el.id : ''
      }"><abbr class="slds-required" title="required">* </abbr>Image File:</label>
      <div class="slds-form-element__control">
        <select class="slds-select ccb-select" id="imageUrl${el ? el.id : ''}" name="imageUrl${
    el ? el.id : ''
  }">  
      </div>
    </div>
  `);
  $(`#imageUrl${el ? el.id : ''}`).append(
    $('<option>', {
      value: '',
      text: '--Select one of the following options--',
    })
  );
  $.each(contentBuilderImages, (i, item) => {
    $(`#imageUrl${el ? el.id : ''}`).append(
      $('<option>', {
        value: item.fileProperties.publishedURL,
        text:
          item.name +
          ' (' +
          Math.round((item.fileProperties.fileSize / 1048576) * 100) / 100 +
          ' MB' +
          ')',
      })
    );
  });
};

const renderZMAttachedFile = () => {
  $('.ccb-form__zmContent-wrapper').append(
    '<div id="ccb-form__Group" class="ccb-form__Group"></div>'
  );
  $('.ccb-form__Group').append(`
    <div class="slds-form-element" id="ccb-form-attachedFile-element">
      <label class="slds-form-element__label ccb-label" for="attachedFile"><abbr class="slds-required" title="required">* </abbr>Attached File: (maximum size of gif, docx, pdf file: 5MB)</label>
      <div class="slds-form-element__control">
        <select class="slds-select ccb-select" type="file" id="attachedFile" name="attachedFile"></select>
      </div>
    </div>
  `);
  $('#attachedFile').append(
    $('<option>', {
      value: '',
      text: '--Select one of the following options--',
    })
  );
  $.each(contentBuilderMetaData, (i, item) => {
    $('#attachedFile').append(
      $('<option>', {
        value: JSON.stringify({
          name: item.name.replace(/ /g, ''),
          type: item.fileProperties.name,
          url: item.fileProperties.publishedURL,
          size: item.fileProperties.fileSize,
          extension: item.fileProperties.extension,
        }),
        text:
          item.name +
          ' (' +
          Math.round((item.fileProperties.fileSize / 1048576) * 100) / 100 +
          ' MB' +
          ')',
      })
    );
  });
  $('#submitBtn').show();
  $('#addNormalList').hide();
  $('#addButtonList').hide();
};

const renderZMRequestUserInfo = () => {
  $('.ccb-form__zmContent-wrapper').append(
    '<div id="ccb-form__Group" class="ccb-form__Group"></div>'
  );
  $('.ccb-form__Group').append(`
    <div class="slds-form-element" id="ccb-form-title-element">
      <label class="slds-form-element__label ccb-label" for="title"><abbr class="slds-required" title="required">* </abbr>Title:</label>
      <div class="slds-form-element__control">
        <textarea class="slds-textarea ccb-textarea" type="text" id="title" name="title" maxlength="100" placeholder="Enter your title. Maximum length: 100"></textarea>
      </div>
    </div>
    <div class="slds-form-element" id="ccb-form-subTitle-element">
      <label class="slds-form-element__label ccb-label" for="subTitle"><abbr class="slds-required" title="required">* </abbr>Subtitle:</label>
      <div class="slds-form-element__control">
        <textarea class="slds-textarea ccb-textarea" type="text" id="subTitle" name="subTitle" maxlength="500" placeholder="Enter your subtitle. Maximum length: 500"></textarea>
      </div>
    </div>
  `);
  renderImageOptions();
  $('#ccb-form__Group').append(`
    <div id="ccb-form-imageUrl-wrapper"></div>
  `);
  $('#submitBtn').show();
  $('#addNormalList').hide();
  $('#addButtonList').hide();
};

const getImageContent = async () => {
  try {
    const result = await superagent.get('/api/getimagecontent');
    return result.body;
  } catch (error) {
    console.log('error: ', error);
    return { status: error };
  }
};

const getMetaDataContent = async () => {
  try {
    const result = await superagent.get('/api/getmetadatacontent');
    return result.body;
  } catch (error) {
    console.log('error: ', error);
    return { status: error };
  }
};

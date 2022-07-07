'use strict';

const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
let channels = '';
let senders = '';
let contentOptions = '';
let contentValue = '';
let tmpContents = '';
let deFields = [];
let deKey = '';
let eventDefinitionKey = '';
let tmpZaloOAList = [];
let tmpSMSSendersList = [];
let steps = [
  { label: 'Channels', key: 'step1' },
  { label: 'Senders', key: 'step2' },
  { label: 'Data', key: 'step3' },
  { label: 'Contents', key: 'step4' },
];
let currentStep = steps[0].key;

const requestedInteractionHandler = async (settings) => {
  if (settings.triggers[0]) {
    eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
  } else {
    displayCustomModalError('Please choose ENTRY EVENT and SAVE Journey before Continue');
    connection.trigger('destroy');
  }
};

connection.on('initActivity', initialize);
connection.on('requestedTokens', onGetTokens);
connection.on('requestedEndpoints', onGetEndpoints);
connection.on('requestedInteraction', requestedInteractionHandler);
connection.on('clickedNext', next);
connection.on('clickedBack', prev);
connection.on('gotoStep', onGotoStep);
connection.on('requestedSchema', function (data) {});

const onRender = () => {
  connection.trigger('ready');
  connection.trigger('requestTokens');
  connection.trigger('requestSenders');
  connection.trigger('requestInteraction');
  connection.trigger('requestSchema');
  $('.ca-modal__validateResult__button').on('click', (e) => {
    $('.ca-modal').hide();
  });

  $('.ca-modal').on('click', (e) => {
    $('.ca-modal').hide();
  });

  $('.ca-modal__validateResult').on('click', (e) => {
    e.stopPropagation();
  });

  $('#SMSValidate').on('click', (e) => {
    checkContent('process');
  });

  $('#Channels').on('change', (e) => {
    if ($('#Channels').val()) {
      connection.trigger('updateButton', {
        button: 'next',
        enabled: true,
      });
    } else {
      connection.trigger('updateButton', {
        button: 'next',
        enabled: false,
      });
    }
  });

  $('#Senders').on('change', async (e) => {
    if ($('#Senders').val() && $('#Channels').val() === 'Zalo Notification Service') {
      try {
        $('.ca-modal').show();
        $('.ca-modal__loading').show();
        $('.ca-modal__validateResult.success').hide();
        $('.ca-modal__validateResult.failed').hide();
        let customContent = await getZNSTemplates($('#Senders').val());
        $('.ca-modal').hide();
        customContent = JSON.parse(customContent);
        console.log('customContent:', customContent);
        if (customContent.resultCode != 0) throw customContent.resultDesc;
        connection.trigger('updateButton', {
          button: 'next',
          enabled: true,
        });
      } catch (error) {
        displayCustomModalError(`${error}`);
        connection.trigger('updateButton', {
          button: 'next',
          enabled: false,
        });
      }
    } else if ($('#Senders').val()) {
      connection.trigger('updateButton', {
        button: 'next',
        enabled: true,
      });
    } else {
      connection.trigger('updateButton', {
        button: 'next',
        enabled: false,
      });
    }
  });

  $('#DEFields').on('change', (e) => {
    if ($('#DEFields').val()) {
      connection.trigger('updateButton', {
        button: 'next',
        enabled: true,
      });
    } else {
      connection.trigger('updateButton', {
        button: 'next',
        enabled: false,
      });
    }
  });

  $('#ContentOptions').on('change', async (e) => {
    contentOptions = $('#ContentOptions').val();
    checkContent('process');
  });
  $('#refreshButton').on('click', async () => {
    $('#ContentValue').val('');
    $('#ContentOptions').empty();
    $('#DisplayContent').empty();
    $('#ca-frame').hide();
    switch ($('#Channels').val()) {
      case 'Zalo Message': {
        try {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.success').hide();
          $('.ca-modal__validateResult.failed').hide();
          const customContent = await getCustomContent();
          $('.ca-modal').hide();
          tmpContents = customContent.items;
          $('#ContentOptions')
            .empty()
            .append(`<option value=''>--Select one of the following contents--</option>`);
          $.each(tmpContents, (index, content) => {
            $('#ContentOptions').append(`<option value=${content.id}>${content.name}</option>`);
          });
          checkContent('refresh');
        } catch (error) {
          displayCustomModalError(`Error on fetching data: ${error.message}`);
        }
        break;
      }
      case 'Zalo Notification Service': {
        try {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.success').hide();
          $('.ca-modal__validateResult.failed').hide();
          let customContent = await getZNSTemplates($('#Senders').val());
          $('.ca-modal').hide();
          customContent = JSON.parse(customContent);
          console.log('customContent:', customContent);
          if (customContent.resultCode === 0) {
            tmpContents = customContent.data;
            console.log('tmpContents:', tmpContents);
            $('#ContentOptions')
              .empty()
              .append(`<option value=''>--Select one of the following contents--</option>`);
            $.each(tmpContents, (index, content) => {
              $('#ContentOptions').append(
                `<option value=${content.templateId}>${content.templateName}</option>`
              );
            });
            checkContent('refresh');
          } else {
            displayCustomModalError(`${customContent.message}`);
          }
        } catch (error) {
          displayCustomModalError(`Error on fetching data: ${error.message}`);
        }
        break;
      }
      case 'SMS': {
        let tmpContentOptions = tmpSMSSendersList.filter(
          (smsSender) => smsSender.name === $('#Senders').val()
        );
        console.log('Content options: ', tmpContentOptions);
        $('#ContentOptions')
          .empty()
          .append(`<option value=''>--Select one of the following contents--</option>`);
        $.each(tmpContentOptions[0].templates, (index, content) => {
          $('#ContentOptions').append(`<option value="${content}">${content}</option>`);
        });
        break;
      }
    }
  });
};

$(window).ready(onRender);
/**
 * Initialization
 * @param data
 */
function initialize(data) {
  console.log('data: ', data);
  if (data) {
    payload = data;
  }
  const hasInArguments = Boolean(
    payload['arguments'] &&
      payload['arguments'].execute &&
      payload['arguments'].execute.inArguments &&
      payload['arguments'].execute.inArguments.length > 0
  );
  const inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};
  $.each(inArguments, (index, inArgument) => {
    $.each(inArgument, (key, value) => {
      switch (key) {
        case 'Channels': {
          channels = value;
          $('#Channels').val(value);
          connection.trigger('updateButton', {
            button: 'next',
            enabled: true,
          });
          break;
        }
        case 'Senders': {
          senders = value;
          $('#Senders').val(value);
          break;
        }
        case 'ContentOptions': {
          contentOptions = value;
          break;
        }
        case 'DEFields': {
          deKey = value;
          break;
        }
        case 'ContentValue': {
          contentValue = value;
          $('#ContentValue').val(value);
          break;
        }
      }
    });
  });
  console.log('channels', channels);
  console.log('deKey', deKey);
  console.log('senders', senders);
  console.log('contentOptions', contentOptions);
  console.log('contentValue', contentValue);
}

/**
 *
 *
 * @param {*} tokens
 */
function onGetTokens(tokens) {
  authTokens = tokens;
}

/**
 *
 *
 * @param {*} senders
 */
function onGetEndpoints(senders) {}

/**
 * Save settings
 */
function save() {
  payload['metaData'].isConfigured = true;
  payload['arguments'].execute.inArguments = [
    {
      contactKey: '{{Contact.Key}}',
    },
  ];
  console.log('payload: ', payload);
  $('.js-activity-setting').each(function () {
    const setting = {
      id: $(this).attr('id'),
      value: $(this).val(),
    };
    $.each(payload['arguments'].execute.inArguments, (index, value) => {
      value[setting.id] = setting.value;
    });
  });
  console.log('payload: ', payload);
  connection.trigger('updateActivity', payload);
}
/**
 * Next settings
 */
function next() {
  if (currentStep.key === 'step4') {
    save();
  } else {
    connection.trigger('nextStep');
  }
}
/**
 * Back settings
 */
function prev() {
  connection.trigger('prevStep');
}

function onGotoStep(step) {
  showStep(step);
  connection.trigger('ready');
}

const showStep = async (step, stepIndex) => {
  if (stepIndex && !step) {
    step = steps[stepIndex - 1];
  }
  currentStep = step;
  $('.step').hide();
  switch (currentStep.key) {
    case 'step1':
      $('#step1').show();
      $('#titleDynamic').empty().append('Channels');
      $('#iconDynamic').attr('xlink:href', '/icons/standard-sprite/svg/symbols.svg#contact_list');
      if ($('#Channels').val()) {
        connection.trigger('updateButton', {
          button: 'next',
          enabled: true,
        });
      } else {
        connection.trigger('updateButton', {
          button: 'next',
          enabled: false,
        });
      }
      break;
    case 'step2':
      $('#step2').show();
      $('#titleDynamic').empty().append('Senders');
      $('#iconDynamic').attr('xlink:href', '/icons/standard-sprite/svg/symbols.svg#contact_list');
      switch ($('#Channels').val()) {
        case 'Zalo Message': {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.success').hide();
          $('.ca-modal__validateResult.failed').hide();
          const ZaloOAList = await getAllZaloOA();
          $('.ca-modal').hide();
          console.log('ZaloOAList', ZaloOAList);
          tmpZaloOAList = ZaloOAList.data;
          $('#Senders')
            .empty()
            .append(`<option value=''>--Select one of the following senders--</option>`);
          $.each(tmpZaloOAList, (index, ZaloOA) => {
            $('#Senders').append(`<option value=${ZaloOA.OAId}>${ZaloOA.OAName}</option>`);
          });
          if (senders && channels === $('#Channels').val()) {
            $('#Senders').val(senders);
          } else $('#Senders').val('');
          break;
        }
        case 'Zalo Notification Service': {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.success').hide();
          $('.ca-modal__validateResult.failed').hide();
          const ZaloOAList = await getAllZaloOA();
          $('.ca-modal').hide();
          console.log('ZaloOAList', ZaloOAList);
          tmpZaloOAList = ZaloOAList.data;
          $('#Senders')
            .empty()
            .append(`<option value=''>--Select one of the following senders--</option>`);
          $.each(tmpZaloOAList, (index, ZaloOA) => {
            $('#Senders').append(`<option value=${ZaloOA.OAId}>${ZaloOA.OAName}</option>`);
          });
          if (senders && channels === $('#Channels').val()) {
            $('#Senders').val(senders);
          } else $('#Senders').val('');
          break;
        }
        case 'SMS': {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.success').hide();
          $('.ca-modal__validateResult.failed').hide();
          const SMSSenders = await getAllSMSSenders();
          $('.ca-modal').hide();
          console.log('SMSSenders', SMSSenders);
          if (tmpSMSSendersList.length === 0) {
            Object.keys(SMSSenders.raw_data[0].templates).forEach((key) => {
              tmpSMSSendersList.push({
                name: key,
                templates: SMSSenders.raw_data[0].templates[key],
              });
            });
          }
          console.log('SMSSenders list', tmpSMSSendersList);
          $('#Senders')
            .empty()
            .append(`<option value=''>--Select one of the following senders--</option>`);
          $.each(tmpSMSSendersList, (index, SMSSenders) => {
            $('#Senders').append(`<option value=${SMSSenders.name}>${SMSSenders.name}</option>`);
          });
          if (senders && channels === $('#Channels').val()) {
            $('#Senders').val(senders);
          } else $('#Senders').val('');
          break;
        }
      }
      if ($('#Senders').val()) {
        connection.trigger('updateButton', {
          button: 'next',
          enabled: true,
        });
      } else {
        connection.trigger('updateButton', {
          button: 'next',
          enabled: false,
        });
      }
      connection.trigger('updateButton', {
        button: 'back',
        enabled: true,
      });
      break;
    case 'step3':
      $('#step3').show();
      $('#titleDynamic').empty().append('Data Extension');
      $('#iconDynamic').attr('xlink:href', '/icons/standard-sprite/svg/symbols.svg#contact_list');
      $('.ca-modal').show();
      $('.ca-modal__loading').show();
      $('.ca-modal__validateResult.failed').hide();
      $('.ca-modal__validateResult.success').hide();
      const deInfo = await getDEInfo(eventDefinitionKey);
      $('.ca-modal').hide();
      $('.js_de_lst').append(`<p>${deInfo.dataExtension.Name}</p>`);
      $('#DEFields')
        .empty()
        .append(`<option value="">--Select one of the following fields--</option>`);
      $.each(deInfo.deCol, (index, field) => {
        deFields.push(field.Name);
        $('#DEFields').append(
          `<option value=${field.CustomerKey} id=${field.Name} class="js-activity-setting">${field.Name}</option>`
        );
        $(`#${field.Name}`).val(`{{Event.${eventDefinitionKey}.${field.Name}}}`);
      });
      if (deKey && channels === $('#Channels').val()) {
        $('#DEFields').val(deKey);
      } else $('#DEFields').val('');
      if ($('#DEFields').val()) {
        connection.trigger('updateButton', {
          button: 'next',
          enabled: true,
        });
      } else {
        connection.trigger('updateButton', {
          button: 'next',
          enabled: false,
        });
      }
      break;
    case 'step4':
      $('#step4').show();
      $('#titleDynamic').empty().append('Contents');
      $('#iconDynamic').attr(
        'xlink:href',
        '/icons/standard-sprite/svg/symbols.svg#code_playground'
      );
      connection.trigger('updateButton', {
        button: 'back',
        enabled: true,
      });
      connection.trigger('updateButton', {
        button: 'next',
        text: 'done',
        enabled: false,
      });
      switch ($('#Channels').val()) {
        case 'Zalo Message': {
          try {
            $('.ca-modal').show();
            $('.ca-modal__loading').show();
            $('.ca-modal__validateResult.failed').hide();
            const customContent = await getCustomContent();
            $('.ca-modal').hide();
            tmpContents = customContent.items;
            $('#ContentOptions')
              .empty()
              .append(`<option value=''>--Select one of the following contents--</option>`);
            $.each(tmpContents, (index, content) => {
              $('#ContentOptions').append(`<option value=${content.id}>${content.name}</option>`);
            });
            checkContent('init');
          } catch (error) {
            displayCustomModalError(`Error on fetching data: ${error.message}`);
          }
          break;
        }
        case 'Zalo Notification Service': {
          try {
            $('.ca-modal').show();
            $('.ca-modal__loading').show();
            $('.ca-modal__validateResult.failed').hide();
            let customContent = await getZNSTemplates($('#Senders').val());
            $('.ca-modal').hide();
            customContent = JSON.parse(customContent);
            console.log('customContent:', customContent);
            if (customContent.resultCode === 0) {
              tmpContents = customContent.data;
              console.log('tmpContents:', tmpContents);
              $('#ContentOptions')
                .empty()
                .append(`<option value=''>--Select one of the following contents--</option>`);
              $.each(tmpContents, (index, content) => {
                $('#ContentOptions').append(
                  `<option value=${content.templateId}>${content.templateName}</option>`
                );
              });
              checkContent('init');
            } else {
              displayCustomModalError(`${customContent.message}`);
            }
          } catch (error) {
            displayCustomModalError(`Error on fetching data: ${error.message}`);
          }
          break;
        }
        case 'SMS': {
          $('#ContentOptions').empty();
          let tmpContentOptions = tmpSMSSendersList.filter(
            (smsSender) => smsSender.name === $('#Senders').val()
          );
          console.log('Content options: ', tmpContentOptions);
          $('#ContentOptions')
            .empty()
            .append(`<option value=''>--Select one of the following contents--</option>`);
          $.each(tmpContentOptions[0].templates, (index, content) => {
            $('#ContentOptions').append(`<option value="${content}">${content}</option>`);
          });
          if (contentOptions) {
            $('#ContentOptions').val(contentOptions);
          } else {
            $('#ContentOptions').val('');
          }
          break;
        }
      }
      break;
  }
};
const checkContent = async (type) => {
  console.log('type: ', type);
  $('#ca-frame').hide();
  $('#DisplayContent').empty();
  let hasError = false;
  let errorKeyList = [];
  let errorMsg = '';
  if ($('#Channels').val() === 'SMS') {
    $('#ca-form-SMSContent-element').removeClass('slds-has-error');
    $('#ca-form-SMSContent-element-text-error').remove();
    $('#ca-form-SMSBID-element').removeClass('slds-has-error');
    $('#ca-form-SMSBID-element-text-error').remove();
    const regex = /%%([\s\S]*?)%%/gm;
    let message;
    if ($('#SMSContent').val() === '') {
      hasError = true;
      errorMsg = 'This field is required';
      displayCustomInputError(errorMsg, 'SMSContent', 'keydown');
    }
    if ($('#SMSBID').val() === '') {
      hasError = true;
      errorMsg = 'This field is required';
      displayCustomInputError(errorMsg, 'SMSBID', 'keydown');
    }
    while ((message = regex.exec($('#SMSContent').val())) !== null) {
      if (message.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      console.log('message:', message);
      if (!deFields.includes(message[1])) {
        hasError = true;
        if (!deFields.includes(message[0])) {
          errorKeyList.push(message[0]);
        }
      }
    }
    if (hasError) {
      if (errorKeyList.length > 0) {
        errorMsg = `Keyword ${errorKeyList.join(
          ', '
        )} trong Content không tồn tại trong Data Extension đã chọn!`;
        displayCustomInputError(errorMsg, 'SMSContent', 'keydown');
        displayCustomModalError(errorMsg);
      } else {
        displayCustomModalError();
      }
      connection.trigger('updateButton', {
        button: 'next',
        enabled: false,
      });
    } else {
      const msg = {
        from: $('#Senders').val(),
        phone: '',
        sms: $('#ContentOptions').val(),
        bid: Date.now(),
      };
      $('#ContentValue').val(JSON.stringify(msg));
      console.log($('#ContentValue').val());
      $('.ca-modal').show();
      $('.ca-modal__loading').hide();
      $('.ca-modal__validateResult.success').show();
      $('.ca-modal__validateResult.failed').hide();
      connection.trigger('updateButton', {
        button: 'next',
        enabled: true,
      });
    }
  } else {
    console.log('tmpContents:', tmpContents);
    console.log(contentOptions);
    if (type === 'process') $('#ContentOptions').val(contentOptions);
    if (type === 'init') {
      console.log(channels);
      console.log($('#Channels').val());
      if (channels !== $('#Channels').val()) {
        $('#ContentOptions').val('');
      } else $('#ContentOptions').val(contentOptions);
    }
    console.log($('#ContentOptions').val());
    if ($('#ContentOptions').val()) {
      switch ($('#Channels').val()) {
        case 'Zalo Message': {
          tmpContents.forEach((value) => {
            if (value.id == $('#ContentOptions').val()) {
              const regex = /%%([\s\S]*?)%%/gm;
              let message;
              while (
                (message = regex.exec(
                  type == 'process'
                    ? JSON.stringify(value.meta.options.customBlockData.payloadData)
                    : $('#ContentValue').val()
                )) !== null
              ) {
                if (message.index === regex.lastIndex) {
                  regex.lastIndex++;
                }
                console.log('message:', message);
                if (!deFields.includes(message[1])) {
                  hasError = true;
                  if (!errorKeyList.includes(message[0])) {
                    errorKeyList.push(message[0]);
                  }
                }
              }
              const payloadData = JSON.stringify(value.meta.options.customBlockData);
              $('#ContentValue').val(payloadData);
              $('#DisplayContent').empty().append(value.content);
            }
          });
          if (hasError == true) {
            displayCustomModalError(
              `Tồn tại giá trị ${errorKeyList.join(
                ', '
              )} trong Content không tồn tại trong Data Extension đã chọn!`
            );
            connection.trigger('updateButton', {
              button: 'next',
              enabled: false,
            });
          } else {
            connection.trigger('updateButton', {
              button: 'next',
              enabled: true,
            });
          }
          break;
        }
        case 'Zalo Notification Service': {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.failed').hide();
          let response = await getZNSTemplateDetail(
            $('#ContentOptions').val(),
            $('#Senders').val()
          );
          $('.ca-modal').hide();
          response = JSON.parse(response);
          console.log('repsonse detail', response);
          $('#ca-frame').show();
          $('#ca-frame').attr('src', response.data.previewUrl);
          contentValue = {
            phone: '',
            template_id: response.data.templateId,
            template_data: {},
          };
          response.data.listParams.map((param) => {
            if (!deFields.includes(param.name)) {
              hasError = true;
              if (!errorKeyList.includes(`%%${param.name}%%`)) {
                errorKeyList.push(`%%${param.name}%%`);
              }
            }
          });
          if (hasError == true) {
            displayCustomModalError(
              `Tồn tại giá trị ${errorKeyList.join(
                ', '
              )} trong Content không tồn tại trong Data Extension đã chọn!`
            );
            connection.trigger('updateButton', {
              button: 'next',
              enabled: false,
            });
          } else {
            $.each(response.data.listParams, (index, param) => {
              contentValue.template_data[param.name] = `%%${param.name}%%`;
            });
            console.log('Content value', contentValue);
            $('#ContentValue').val(JSON.stringify(contentValue));
            console.log('contentValue', $('#ContentValue').val());
            connection.trigger('updateButton', {
              button: 'next',
              enabled: true,
            });
          }
          break;
        }
        default:
          break;
      }
    } else {
      connection.trigger('updateButton', {
        button: 'next',
        enabled: false,
      });
    }
  }
};

const getCustomContent = async () => {
  try {
    const response = await superagent.get('/api/sfmc/getcustomcontent');
    return response.body;
  } catch (error) {
    displayCustomModalError(error.message);
    throw new Error(error.message);
  }
};

const getDEInfo = async (key) => {
  try {
    const response = await superagent.post('/api/sfmc/getdeinfo').send({ key });
    return response.body;
  } catch (error) {
    displayCustomModalError('Please choose ENTRY EVENT and SAVE Journey before Continue');
    connection.trigger('destroy');
    throw new Error(error.message);
  }
};

const getZNSTemplates = async (OAId) => {
  try {
    const response = await superagent.post('/api/zalo/getznstemplates').send({ OAId });
    return response.text;
  } catch (error) {
    displayCustomModalError(error.message);
    throw new Error(error.message);
  }
};

const getZNSTemplateDetail = async (TemplateId, OAId) => {
  try {
    const response = await superagent
      .post('/api/zalo/getznstemplatedetail')
      .send({ TemplateId, OAId });
    return response.text;
  } catch (error) {
    displayCustomModalError(error.message);
    throw new Error(error.message);
  }
};

const getAllSMSSenders = async () => {
  const { body: smsSenderList } = await superagent.get('/api/smssenders');
  if (smsSenderList.error == 0) {
    return smsSenderList;
  }
  displayCustomModalError(error.log);
  throw new Error(error.log);
};

const getAllZaloOA = async () => {
  try {
    const response = await superagent.get('/api/zalooa');
    return response.body;
  } catch (error) {
    displayCustomModalError(error.message);
    throw new Error(error.message);
  }
};

const displayCustomModalError = (message) => {
  $('.ca-modal').show();
  $('.ca-modal__loading').hide();
  $('.ca-modal__validateResult.failed').show();
  if (message) {
    $('.ca-modal__validateResult__error-message').text(message);
  } else {
    $('.ca-modal__validateResult__error-message').text(
      'An error occurred while submitting the form. Please try again'
    );
  }
};

const displayCustomInputError = (message, selector, event) => {
  $(`#ca-form-${selector}-element`).addClass('slds-has-error');
  $(`#ca-form-${selector}-element`).append(
    `<div class="slds-form-element__help ca-form__error" id="ca-form-${selector}-element-text-error">${message}</div>`
  );
  $(`#${selector}`).on(event, () => {
    $(`#ca-form-${selector}-element`).removeClass('slds-has-error');
    $(`#ca-form-${selector}-element-text-error`).remove();
  });
};

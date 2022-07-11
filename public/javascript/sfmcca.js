'use strict';

const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};

// Stored Data
let storedChannel = '';
let storedSender = '';
let storedContentOption = '';
let storedContentValue = '';
let storedDEFields = [];
let storedDEKey = '';
let storedMNOOption = '';
let storedTemplateOption = '';
let storedEventDefinitionKey = '';

// Temp Data
let tmpContents = '';
let tmpSMSMNOList = [];
let tmpSMSTemplateList = [];
let tmpZaloOAList = [];
let tmpSMSSenderList = [];

let steps = [
  { label: 'Channels', key: 'step1' },
  { label: 'Senders', key: 'step2' },
  { label: 'Data', key: 'step3' },
  { label: 'Contents', key: 'step4' },
];
let currentStep = steps[0].key;

const requestedInteractionHandler = async (settings) => {
  if (settings.triggers[0]) {
    storedEventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
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

  $('#MNOOptions').on('change', () => {
    console.log(tmpSMSTemplateList[$('#MNOOptions').val()]);
    $('#TemplateOptions')
      .empty()
      .append(`<option value=''>--Select one of the following templates--</option>`);
    $.each(tmpSMSTemplateList[$('#MNOOptions').val()], (index, template) => {
      $('#TemplateOptions').append(`<option value="${template}">${template}</option>`);
    });
    $('#SMSMessage').empty();
  });

  $('#TemplateOptions').on('change', () => {
    $('#SMSMessage').empty().text($('#TemplateOptions').val());
  });

  $('#Senders').on('change', async (e) => {
    if ($('#Senders').val() && $('#Channels').val() === 'Zalo Notification Service') {
      try {
        let customContent = await loadingContent(getZNSTemplates, $('#Senders').val());
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
    storedContentOption = $('#ContentOptions').val();
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
          const customContent = await loadingContent(getCustomContent());
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
          let customContent = await loadingContent(getZNSTemplates, $('#Senders').val());
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
        let tmpContentOptions = tmpSMSSenderList.filter(
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
          storedChannel = value;
          $('#Channels').val(value);
          connection.trigger('updateButton', {
            button: 'next',
            enabled: true,
          });
          break;
        }
        case 'Senders': {
          storedSender = value;
          $('#Senders').val(value);
          break;
        }
        case 'ContentOptions': {
          storedContentOption = value;
          break;
        }
        case 'DEFields': {
          storedDEKey = value;
          break;
        }
        case 'ContentValue': {
          storedContentValue = value;
          break;
        }
        case 'MNOOptions': {
          storedMNOOption = value;
          break;
        }
        case 'TemplateOptions': {
          storedTemplateOption = value;
          break;
        }
      }
    });
  });
  console.log('storedChannel', storedChannel);
  console.log('storedDEKey', storedDEKey);
  console.log('storedSender', storedSender);
  console.log('storedContentOption', storedContentOption);
  console.log('storedContentValue', storedContentValue);
  console.log('storedMNOOption', storedMNOOption);
  console.log('storedTemplateOption', storedTemplateOption);
}

function onGetTokens(tokens) {
  authTokens = tokens;
}

function onGetEndpoints(storedSender) {}

function save() {
  payload['metaData'].isConfigured = true;
  payload['arguments'].execute.inArguments = [
    {
      contactKey: '{{Contact.Key}}',
    },
  ];
  $('.js-activity-setting').each(function () {
    const setting = {
      id: $(this).attr('id'),
      value: $(this).val(),
    };
    $.each(payload['arguments'].execute.inArguments, (index, value) => {
      value[setting.id] = setting.value;
    });
  });
  console.log('payload', payload);
  // connection.trigger('updateActivity', payload);
}

function next() {
  if (currentStep.key === 'step4') {
    save();
  } else {
    connection.trigger('nextStep');
  }
}

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
          const ZaloOAList = await loadingContent(getAllZaloOA);
          console.log('ZaloOAList', ZaloOAList);
          tmpZaloOAList = ZaloOAList.data;
          $('#Senders')
            .empty()
            .append(`<option value=''>--Select one of the following storedSender--</option>`);
          $.each(tmpZaloOAList, (index, ZaloOA) => {
            $('#Senders').append(`<option value=${ZaloOA.OAId}>${ZaloOA.OAName}</option>`);
          });
          if (storedSender && storedChannel === $('#Channels').val()) {
            $('#Senders').val(storedSender);
          } else $('#Senders').val('');
          break;
        }
        case 'Zalo Notification Service': {
          const ZaloOAList = await loadingContent(getAllZaloOA);
          console.log('ZaloOAList', ZaloOAList);
          tmpZaloOAList = ZaloOAList.data;
          $('#Senders')
            .empty()
            .append(`<option value=''>--Select one of the following storedSender--</option>`);
          $.each(tmpZaloOAList, (index, ZaloOA) => {
            $('#Senders').append(`<option value=${ZaloOA.OAId}>${ZaloOA.OAName}</option>`);
          });
          if (storedSender && storedChannel === $('#Channels').val()) {
            $('#Senders').val(storedSender);
          } else $('#Senders').val('');
          break;
        }
        case 'SMS': {
          let { raw_data } = await loadingContent(getAllSMSSenders);
          tmpSMSSenderList = raw_data;
          console.log('SMSSenders list', tmpSMSSenderList);
          $('#Senders')
            .empty()
            .append(`<option value=''>--Select one of the following storedSender--</option>`);
          $.each(tmpSMSSenderList, (index, SMSSenders) => {
            $('#Senders').append(
              `<option value=${SMSSenders.senderName}>${SMSSenders.senderName}</option>`
            );
          });
          if (storedSender && storedChannel === $('#Channels').val()) {
            $('#Senders').val(storedSender);
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
      console.log('storedEventDefinitionKey', storedEventDefinitionKey);
      const deInfo = await loadingContent(getDEInfo, storedEventDefinitionKey);
      $('.js_de_lst').append(`<p>${deInfo.dataExtension.Name}</p>`);
      $('#DEFields')
        .empty()
        .append(`<option value="">--Select one of the following fields--</option>`);
      $.each(deInfo.deCol, (index, field) => {
        storedDEFields.push(field.Name);
        $('#DEFields').append(
          `<option value=${field.CustomerKey} id=${field.Name} class="js-activity-setting">${field.Name}</option>`
        );
        $(`#${field.Name}`).val(`{{Event.${storedEventDefinitionKey}.${field.Name}}}`);
      });
      if (storedDEKey && storedChannel === $('#Channels').val()) {
        $('#DEFields').val(storedDEKey);
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
            $('#SMSContentContainer').hide();
            $('#ZaloContentContainer').show();
            const customContent = await loadingContent(getCustomContent);
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
            $('#SMSContentContainer').hide();
            $('#ZaloContentContainer').show();
            let customContent = await loading(getZNSTemplates, $('#Senders').val());
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
          $('#ZaloContentContainer').hide();
          $('#SMSContentContainer').show();
          $('#ContentOptions').empty();
          $('#ca-form-SMSDEKeys-element').empty();
          $.each(storedDEFields, (index, field) => {
            $('#ca-form-SMSDEKeys-element').append(`<div>${field}</div>`);
          });
          let tmpSMSMNOList = tmpSMSSenderList.filter(
            (smsSender) => smsSender.senderName === $('#Senders').val()
          );
          tmpSMSTemplateList = tmpSMSMNOList[0].templates;
          console.log('Content options: ', tmpSMSMNOList);
          $('#MNOOptions')
            .empty()
            .append(`<option value=''>--Select one of the following MNO--</option>`);
          Object.keys(tmpSMSMNOList[0].templates).forEach((MNOName) => {
            $('#MNOOptions').append(`<option value="${MNOName}">${MNOName}</option>`);
          });
          $('#TemplateOptions')
            .empty()
            .append(`<option value=''>--Select one of the following templates--</option>`);
          if (storedMNOOption && storedTemplateOption && storedContentValue) {
            $('#MNOOptions').val(storedMNOOption);
            let tmpSMSMNOList = tmpSMSSenderList.filter(
              (smsSender) => smsSender.senderName === $('#Senders').val()
            );
            tmpSMSTemplateList = tmpSMSMNOList[0].templates;
            $('#TemplateOptions')
              .empty()
              .append(`<option value=''>--Select one of the following templates--</option>`);
            $.each(tmpSMSTemplateList[$('#MNOOptions').val()], (index, template) => {
              $('#TemplateOptions').append(`<option value="${template}">${template}</option>`);
            });
            $('#TemplateOptions').val(storedTemplateOption);
            $('#SMSMessage').val(storedContentValue);
            $('#ContentValue').val(storedContentValue);
            connection.trigger('updateButton', {
              button: 'next',
              enabled: true,
            });
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
    if ($('#SMSMessage').val() === '') {
      hasError = true;
      errorMsg = 'This field is required';
      displayCustomInputError(errorMsg, 'SMSMessage', 'keydown');
    }
    while ((message = regex.exec($('#SMSMessage').val())) !== null) {
      if (message.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      console.log('message:', message);
      if (!storedDEFields.includes(message[1])) {
        hasError = true;
        if (!storedDEFields.includes(message[0])) {
          errorKeyList.push(message[0]);
        }
      }
    }
    if (hasError) {
      if (errorKeyList.length > 0) {
        errorMsg = `Keyword ${errorKeyList.join(
          ', '
        )} trong Content không tồn tại trong Data Extension đã chọn!`;
        displayCustomInputError(errorMsg, 'SMSMessage', 'keydown');
        displayCustomModalError(errorMsg);
      } else {
        displayCustomModalError();
      }
      connection.trigger('updateButton', {
        button: 'next',
        enabled: false,
      });
    } else {
      $('#ContentValue').val($('#SMSMessage').text());
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
    console.log(storedContentOption);
    if (type === 'process') $('#ContentOptions').val(storedContentOption);
    if (type === 'init') {
      console.log(storedChannel);
      console.log($('#Channels').val());
      if (storedChannel !== $('#Channels').val()) {
        $('#ContentOptions').val('');
      } else $('#ContentOptions').val(storedContentOption);
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
                if (!storedDEFields.includes(message[1])) {
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
          let response = await loadingContent(
            getZNSTemplateDetail({
              TemplateId: $('#ContentOptions').val(),
              OAId: $('#Senders').val(),
            })
          );
          console.log('repsonse detail', response);
          $('#ca-frame').show();
          $('#ca-frame').attr('src', response.data.previewUrl);
          storedContentValue = {
            phone: '',
            template_id: response.data.templateId,
            template_data: {},
          };
          response.data.listParams.map((param) => {
            if (!storedDEFields.includes(param.name)) {
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
              storedContentValue.template_data[param.name] = `%%${param.name}%%`;
            });
            console.log('Content value', storedContentValue);
            $('#ContentValue').val(JSON.stringify(storedContentValue));
            console.log('storedContentValue', $('#ContentValue').val());
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
    console.log('key:', key);
    const response = await superagent.post('/api/sfmc/getdeinfo').send({ key });
    console.log('deinfo', key, response.body);
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
    return response.body;
  } catch (error) {
    displayCustomModalError(error.message);
    throw new Error(error.message);
  }
};

const getZNSTemplateDetail = async ({ TemplateId, OAId }) => {
  try {
    const response = await superagent
      .post('/api/zalo/getznstemplatedetail')
      .send({ TemplateId, OAId });
    return response.body;
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
  $('.ca-modal__validateResult.success').hide();
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

const loadingContent = async (asyncFn, param) => {
  $('.ca-modal').show();
  $('.ca-modal__loading').show();
  $('.ca-modal__validateResult.success').hide();
  $('.ca-modal__validateResult.failed').hide();
  let result;
  console.log('param', param);
  if (param) {
    result = await asyncFn(param);
  } else {
    result = await asyncFn();
  }
  $('.ca-modal').hide();
  return result;
};

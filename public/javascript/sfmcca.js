'use strict';
const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
let channels = '';
let endpoints = '';
let contentOptions = '';
let contentValue = '';
let tmpContents = '';
let deFields = [];
let eventDefinitionKey = '';
let tmpZOAList = [];
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
    try {
      $('.ca-modal').show();
      $('.ca-modal__loading').show();
      $('.ca-modal__validateResult.failed').hide();
      const deInfo = await getDEInfo(eventDefinitionKey);
      $('.ca-modal').hide();
      $('.js_de_lst').append(`<p>${deInfo.dataExtension.Name}</p>`);
      $('#DEFields').empty();
      $.each(deInfo.deCol, (index, field) => {
        deFields.push(field.Name);
        $('#DEFields').append(
          `<p value=${field.CustomerKey} id=${field.Name} class="js-activity-setting">${field.Name}</p>`
        );
        $(`#${field.Name}`).val(`{{Event.${eventDefinitionKey}.${field.Name}}}`);
      });
    } catch (error) {
      displayCustomError('Please choose ENTRY EVENT and SAVE Journey before Continue');
      $('.ca-modal').show();
      $('.ca-modal__loading').hide();
      $('.ca-modal__validateResult.failed').show();
      connection.trigger('destroy');
    }
  } else {
    displayCustomError('Please choose ENTRY EVENT and SAVE Journey before Continue');
    $('.ca-modal').show();
    $('.ca-modal__loading').hide();
    $('.ca-modal__validateResult.failed').show();
    connection.trigger('destroy');
  }
};

connection.on('initActivity', initialize);
connection.on('requestedTokens', onGetTokens);
connection.on('requestedSenders', onGetSenders);
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
    console.log('this', $(this));
  });

  $('.ca-modal').on('click', (e) => {
    $('.ca-modal').hide();
  });

  $('.ca-modal__validateResult').on('click', (e) => {
    e.stopPropagation();
  });

  $('#SMSValidate').on('click', (e) => {
    console.log($('#SMSSender').val());
    console.log($('#SMSReceiver').val());
    console.log($('#SMSContent').val());
    console.log($('#SMSBID').val());
    const msg = {
      sms: $('#SMSContent').val(),
      bid: $('#SMSBID').val(),
    };
    $('#ContentValue').val(JSON.stringify(msg));
    console.log($('#ContentValue').val());
    connection.trigger('updateButton', {
      button: 'next',
      enabled: true,
    });
  });

  $('#Channels').on('change', (e) => {
    // if ($('#Channels').val() === 'SMS') {
    //   displayCustomError('This channel is not supported yet. Please select another channel!');
    //   $('.ca-modal').show();
    //   $('.ca-modal__loading').hide();
    //   $('.ca-modal__validateResult.failed').show();
    //   connection.trigger('updateButton', {
    //     button: 'next',
    //     enabled: false,
    //   });
    // }
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
    if ($('#Senders').val()) {
      if ($('#Channels').val() === 'Zalo Notification Service') {
        try {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.failed').hide();
          let customContent = await getZNSTemplates($('#Senders').val());
          $('.ca-modal').hide();
          customContent = JSON.parse(customContent);
          console.log('customContent:', customContent);
          if (customContent.error !== 0) throw customContent.message;
          connection.trigger('updateButton', {
            button: 'next',
            enabled: true,
          });
        } catch (error) {
          displayCustomError(`${error}`);
          $('.ca-modal').show();
          $('.ca-modal__loading').hide();
          $('.ca-modal__validateResult.failed').show();
          connection.trigger('updateButton', {
            button: 'next',
            enabled: false,
          });
        }
      } else {
        connection.trigger('updateButton', {
          button: 'next',
          enabled: true,
        });
      }
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
          displayCustomError(`Error on fetching data: ${error.message}`);
          $('.ca-modal').show();
          $('.ca-modal__loading').hide();
          $('.ca-modal__validateResult.failed').show();
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
          if (customContent.error === 0) {
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
            displayCustomError(`${customContent.message}`);
            $('.ca-modal').show();
            $('.ca-modal__loading').hide();
            $('.ca-modal__validateResult.failed').show();
          }
        } catch (error) {
          displayCustomError(`Error on fetching data: ${error.message}`);
          $('.ca-modal').show();
          $('.ca-modal__loading').hide();
          $('.ca-modal__validateResult.failed').show();
        }
        break;
      }
      case 'SMS': {
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
          endpoints = value;
          $('#Senders').val(value);
          break;
        }
        case 'ContentOptions': {
          contentOptions = value;
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
  console.log('endpoints', endpoints);
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
 * @param {*} endpoints
 */
function onGetSenders(endpoints) {}

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
      if ($('#Channels').val() === 'SMS') {
        connection.trigger('updateButton', {
          button: 'next',
          enabled: false,
        });
      } else if ($('#Channels').val()) {
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
        case ('Zalo Message', 'Zalo Notification Service'): {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.failed').hide();
          const ZOAList = await getAllZOA();
          $('.ca-modal').hide();
          console.log('ZOAList', ZOAList);
          tmpZOAList = ZOAList.data;
          $('#Senders')
            .empty()
            .append(`<option value=''>--Select one of the following senders--</option>`);
          $.each(tmpZOAList, (index, ZOA) => {
            $('#Senders').append(`<option value=${ZOA.OAId}>${ZOA.OAName}</option>`);
          });
          break;
        }
        case 'SMS': {
          $('.ca-modal').show();
          $('.ca-modal__loading').show();
          $('.ca-modal__validateResult.failed').hide();
          const SMSSenders = await getAllSMSSenders();
          $('.ca-modal').hide();
          console.log('SMSSenders', SMSSenders);
          tmpSMSSendersList = SMSSenders.data;
          $('#Senders')
            .empty()
            .append(`<option value=''>--Select one of the following senders--</option>`);
          $.each(tmpSMSSendersList, (index, SMSSenders) => {
            $('#Senders').append(`<option value=${SMSSenders.Name}>${SMSSenders.Name}</option>`);
          });
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
      connection.trigger('updateButton', {
        button: 'next',
        enabled: true,
      });
      connection.trigger('updateButton', {
        button: 'back',
        enabled: true,
      });
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
            displayCustomError(`Error on fetching data: ${error.message}`);
            $('.ca-modal').show();
            $('.ca-modal__loading').hide();
            $('.ca-modal__validateResult.failed').show();
          }
          break;
        }
        case 'Zalo Notification Service': {
          try {
            $('#SMSContentContainer').hide();
            $('.ca-modal').show();
            $('.ca-modal__loading').show();
            $('.ca-modal__validateResult.failed').hide();
            let customContent = await getZNSTemplates($('#Senders').val());
            $('.ca-modal').hide();
            customContent = JSON.parse(customContent);
            console.log('customContent:', customContent);
            if (customContent.error === 0) {
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
              displayCustomError(`${customContent.message}`);
              $('.ca-modal').show();
              $('.ca-modal__loading').hide();
              $('.ca-modal__validateResult.failed').show();
            }
          } catch (error) {
            displayCustomError(`Error on fetching data: ${error.message}`);
            $('.ca-modal').show();
            $('.ca-modal__loading').hide();
            $('.ca-modal__validateResult.failed').show();
          }
          break;
        }
        case 'SMS': {
          $('#ContentOptions').empty();
          $('#SMSContentContainer').show();
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
  let error = false;
  let errorContent = [];
  console.log('tmpContents:', tmpContents);
  console.log(contentOptions);
  if (type !== 'refresh') $('#ContentOptions').val(contentOptions);
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
                type == 'process' ? value.content : $('#ContentValue').val()
              )) !== null
            ) {
              if (message.index === regex.lastIndex) {
                regex.lastIndex++;
              }
              if (!deFields.includes(message[1])) {
                error = true;
                errorContent.push(message[0]);
              }
            }
            const payloadData = value.meta.options.customBlockData;
            console.log('payloadData', payloadData);
            $('#ContentValue').val(JSON.stringify(payloadData));
            $('#DisplayContent').empty().append(value.content);
          }
        });
        if (error == true) {
          displayCustomError(
            `Tồn tại giá trị ${errorContent.join(
              ', '
            )} trong Content không tồn tại trong Data Extension đã chọn!`
          );
          $('.ca-modal').show();
          $('.ca-modal__loading').hide();
          $('.ca-modal__validateResult.failed').show();
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
          phone: '%%phone%%',
          template_id: response.data.templateId,
          template_data: {},
        };
        $.each(response.data.listParams, (index, param) => {
          contentValue.template_data[param.name] = `%%${param.name}%%`;
        });
        $('#ContentValue').val(JSON.stringify(contentValue));
        console.log('contentValue', $('#ContentValue').val());
        connection.trigger('updateButton', {
          button: 'next',
          enabled: true,
        });
        break;
      }
      case 'SMS': {
        break;
      }
      default:
        break;
    }
  } else if ($('#Channels').val() === 'SMS') {
    // console.log($('#SMSSender')).val();
    // console.log($('#SMSReceiver')).val();
    // console.log($('#SMSContent')).val();
    // console.log($('#SMSBID')).val();
    // const SMSContent = {
    //   u: 'acfc',
    //   pwd: 'Acfc@1234',
    //   from: 'NIKE',
    //   phone: '',
    //   sms: '',
    //   bid: '',
    //   json: '1',
    // };
    // $('#ContentValue').val(JSON.stringify(SMSContent));
  } else {
    connection.trigger('updateButton', {
      button: 'next',
      enabled: false,
    });
  }
};

const getCustomContent = async () => {
  try {
    const response = await superagent.get('/api/sfmc/getcustomcontent');
    return response.body;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getDEInfo = async (key) => {
  try {
    const response = await superagent.post('/api/sfmc/getdeinfo').send({ key });
    return response.body;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getZNSTemplates = async (OAId) => {
  try {
    const response = await superagent.post('/api/zalo/getznstemplates').send({ OAId });
    return response.text;
  } catch (error) {
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
    throw new Error(error.message);
  }
};

const getAllSMSSenders = async () => {
  try {
    const response = await superagent.get('/api/smssenders');
    return response.body;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllZOA = async () => {
  try {
    const response = await superagent.get('/api/zoa');
    return response.body;
  } catch (error) {
    throw new Error(error.message);
  }
};

const displayCustomError = (message) => {
  if (message) {
    $('.ca-modal__validateResult__error-message').text(message);
  } else {
    $('.ca-modal__validateResult__error-message').text(
      'An error occurred while submitting the form. Please try again'
    );
  }
};

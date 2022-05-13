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

let steps = [
  { label: 'Channels', key: 'step1' },
  { label: 'Endpoints', key: 'step2' },
  { label: 'Data', key: 'step3' },
  { label: 'Contents', key: 'step4' },
];
let currentStep = steps[0].key;

const requestedInteractionHandler = async (settings) => {
  console.log('settings', settings);
  if (settings.triggers[0]) {
    eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
    try {
      $('.ca-modal').show();
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
      alert('Please choose ENTRY EVENT and SAVE Journey before Continue');
      connection.trigger('destroy');
    }
  } else {
    alert('Please choose ENTRY EVENT and SAVE Journey before Continue');
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
  connection.trigger('requestEndpoints');
  connection.trigger('requestInteraction');
  connection.trigger('requestSchema');
  $('#Channels').on('change', (e) => {
    if ($('#Channels').val() === 'SMS') {
      alert('This channel is not supported yet. Please select another channel!');
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
  });
  $('#Endpoints').on('change', async (e) => {
    if ($('#Endpoints').val()) {
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
  $('#ContentOptions').on('change', (e) => {
    contentOptions = $('#ContentOptions').val();
    checkContent('process');
  });
  $('#refreshButton').on('click', async () => {
    $('#ContentValue').val('');
    $('#ContentOptions').empty();
    $('#DisplayContent').empty();
    switch ($('#Channels').val()) {
      case 'Zalo Message': {
        try {
          $('.ca-modal').show();
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
          alert(`Error on fetching data: ${error.message}`);
        }
        break;
      }
      case 'Zalo Notification Service': {
        try {
          $('.ca-modal').show();
          let customContent = await getZNSTemplates($('#Endpoints').val());
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
            alert(`${customContent.message}`);
          }
        } catch (error) {
          alert(`Error on fetching data: ${error.message}`);
        }
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
        case 'Endpoints': {
          endpoints = value;
          $('#Endpoints').val(value);
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
function onGetEndpoints(endpoints) {}

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
      $('#titleDynamic').empty().append('Endpoints');
      $('#iconDynamic').attr('xlink:href', '/icons/standard-sprite/svg/symbols.svg#contact_list');
      if ($('#Endpoints').val()) {
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
      console.log($('#Endpoints').val());
      switch ($('#Channels').val()) {
        case 'Zalo Message': {
          try {
            $('.ca-modal').show();
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
            alert(`Error on fetching data: ${error.message}`);
          }
          break;
        }
        case 'Zalo Notification Service': {
          try {
            $('.ca-modal').show();
            let customContent = await getZNSTemplates($('#Endpoints').val());
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
              alert(`${customContent.message}`);
            }
          } catch (error) {
            alert(`Error on fetching data: ${error.message}`);
          }
          break;
        }
      }
      break;
  }
};
function checkContent(type) {
  console.log('type: ', type);
  let error = false;
  let errorContent = [];
  console.log('tmpContents:', tmpContents);
  if (type !== 'refresh') $('#ContentOptions').val(contentOptions);
  if ($('#ContentOptions').val()) {
    tmpContents.forEach((value) => {
      if (value.id == $('#ContentOptions').val()) {
        const regex = /%%([\s\S]*?)%%/gm;
        let message;
        while (
          (message = regex.exec(type == 'process' ? value.content : $('#ContentValue').val())) !==
          null
        ) {
          if (message.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          if (!deFields.includes(message[1])) {
            error = true;
            errorContent.push(message[0]);
          }
        }
        // if (type == 'process') {
        const payloadData = value.meta.options.customBlockData;
        console.log('payloadData', payloadData);
        $('#ContentValue').val(JSON.stringify(payloadData));
        $('#DisplayContent').empty().append(value.content);
        // }
      }
    });
    if (error == true) {
      alert(`Tồn tại giá trị ${errorContent.join(', ')} trong Content không hợp lệ !`);
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
  } else {
    connection.trigger('updateButton', {
      button: 'next',
      enabled: false,
    });
  }
}

const getCustomContent = async () => {
  try {
    const response = await superagent.get('/api/getcustomcontent');
    return response.body;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getDEInfo = async (key) => {
  try {
    const response = await superagent.post('/api/getdeinfo').send({ key });
    return response.body;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getZNSTemplates = async (OAId) => {
  try {
    const response = await superagent.post('/api/getznstemplates').send({ OAId });
    return response.text;
  } catch (error) {
    throw new Error(error.message);
  }
};

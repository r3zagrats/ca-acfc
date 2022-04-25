'use strict';
const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
var tmpCustomContents = [];
var tmpIndexContent = null;
var ContentOptions = '';
var DEFieldsKey = '';
var deFields = [];
var eventDefinitionKey = '';

var steps = [
  { label: 'Channel', key: 'step1' },
  { label: 'Endpoint', key: 'step2' },
  { label: 'Data', key: 'step3' },
  { label: 'Content', key: 'step4' },
];
var currentStep = steps[0].key;

const requestedInteractionHandler = async (settings) => {
  console.log('--debug requestedInteractionHandler:');
  console.log('settings:', settings);
  eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
  try {
    const deInfo = await getEvent(eventDefinitionKey);
    console.log('deInfo: ', deInfo);
    $('.js_de_lst').append(`<p>${deInfo.dataExtension.Name}</p>`);
    // $('#DEFieldsKey').empty();
    $('#DEFields').empty();
    // $('#DEFieldsKey').append(`<option value=''>--Select one of the following fields--</option>`);
    $.each(deInfo.deCol, (index, field) => {
      deFields.push(field.Name);
      // $('#DEFieldsKey').append(`<option value=${field.Name}>${field.Name}</option>`);
      $('#DEFields').append(
        `<p value=${field.CustomerKey} id=${field.Name} class="js-activity-setting">${field.Name}</p>`
      );
    });
  } catch (error) {
    alert('Please choose ENTRY EVENT and SAVE Journey before Continue');
    // connection.trigger('destroy');
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
  $('#Endpoints').on('change', (e) => {
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
  // $('#DEFieldsKey').on('change', (e) => {
  //   if ($('#DEFieldsKey').val()) {
  //     connection.trigger('updateButton', {
  //       button: 'next',
  //       enabled: true,
  //     });
  //   } else {
  //     connection.trigger('updateButton', {
  //       button: 'next',
  //       enabled: false,
  //     });
  //   }
  // });
  $('#ContentOptions').on('change', (e) => {
    $('#ContentValue').val('');
    checkContent('process');
  });
  $('#refreshButton').on('click', async () => {
    $('#ContentValue').val('');
    $('#ContentOptions').empty();
    $('#DisplayContent').empty();
    try {
      const customContent = await getCustomContent();
      tmpCustomContents = customContent.items;
      tmpIndexContent = null;
      $('#ContentOptions').append(
        `<option value=''>--Select one of the following contents--</option>`
      );
      $.each(tmpCustomContents, (index, content) => {
        $('#ContentOptions').append(`<option value=${content.id}>${content.name}</option>`);
      });
      checkContent('process');
    } catch (error) {
      alert(`Error on fetching data: ${error.message}`);
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
  console.log('hasInArguments: ', hasInArguments);
  const inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};
  if (hasInArguments) tmpIndexContent = payload['arguments'].execute.inArguments[0].tmpIndex;
  console.log('inArguments Before: ', inArguments);
  $.each(inArguments, (index, inArgument) => {
    $.each(inArgument, (key, value) => {
      const $el = $('#' + key);
      if ($el.attr('type') === 'checkbox') {
        $el.prop('checked', value === 'true');
      } else {
        $el.val(value);
      }
      if (key === 'ContentOptions') {
        ContentOptions = value;
      }
      // if (key === 'DEFieldsKey') {
      //   DEFieldsKey = value;
      // }
    });
  });
  console.log('inArguments After:', inArguments);
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
  console.dir('payload: ', payload);
  payload['arguments'].execute.inArguments = [
    {
      contactKey: '{{Contact.Key}}',
      tmpIndex: tmpIndexContent,
    },
  ];
  tmpIndexContent = null;
  console.dir('payload: ', payload);
  $('.js-activity-setting').each(() => {
    const $el = $(this);
    const setting = {
      id: $(this).attr('id'),
      value: $(this).val(),
    };
    $.each(payload['arguments'].execute.inArguments, (index, value) => {
      if ($el.attr('type') === 'checkbox') {
        if ($el.is(':checked')) {
          value[setting.id] = setting.value;
        } else {
          value[setting.id] = 'false';
        }
      } else {
        value[setting.id] = setting.value;
      }
    });
  });
  console.dir('payload:', payload);
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
      $('#titleDynamic').empty().append('Channel');
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
      $('#titleDynamic').empty().append('Endpoint');
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
      // if ($('#DEFieldsKey').val()) {
      //   connection.trigger('updateButton', {
      //     button: 'next',
      //     enabled: true,
      //   });
      // } else {
      //   connection.trigger('updateButton', {
      //     button: 'next',
      //     enabled: false,
      //   });
      // }
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
      $('#titleDynamic').empty().append('Content');
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
      try {
        const customContent = await getCustomContent();
        tmpCustomContents = customContent.items;
        tmpIndexContent = null;
        $('#ContentOptions').empty();
        $('#ContentOptions').append(
          `<option value=''>--Select one of the following contents--</option>`
        );
        $.each(tmpCustomContents, (index, content) => {
          $('#ContentOptions').append(`<option value=${content.id}>${content.name}</option>`);
        });
        checkContent('init');
      } catch (error) {
        alert(`Error on fetching data: ${error.message}`);
      }
      break;
  }
};

function checkContent(type) {
  let error = false;
  let errorContent = [];
  //var dataRex = type == 'process' ? value.content : $("#ContentValue").val();
  console.log($('#ContentValue').val());
  console.log('tmpCustomContents: ', tmpCustomContents);
  console.log('tmpIndexContent: ' + tmpIndexContent);
  if (tmpIndexContent !== null) {
    const payloadData = tmpCustomContents[tmpIndexContent].meta.options.customBlockData;
    console.log('payloadData', payloadData);
    $('#ContentValue').val(JSON.stringify(payloadData));
    $('#DisplayContent').empty();
    $('#DisplayContent').append(tmpCustomContents[tmpIndexContent].content);
  }
  if ($('#ContentOptions').val()) {
    console.log($('#ContentValue').val());
    tmpCustomContents.forEach((value) => {
      if (value.id == $('#ContentOptions').val()) {
        const regex = /%%([\s\S]*?)%%/gm;
        let message;
        while (
          (message = regex.exec(type == 'process' ? value.content : $('#ContentValue').val())) !==
          null
        ) {
          console.log('message', message);
          if (message.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          if (!deFields.includes(message[1])) {
            console.log('deFields:', deFields);
            connection.trigger('updateButton', {
              button: 'next',
              enabled: false,
            });
            error = true;
            errorContent.push(message[0]);
          }
        }
        if (type == 'process') {
          tmpIndexContent = tmpCustomContents.indexOf(value);
          const payloadData = value.meta.options.customBlockData;
          console.log('payloadData', payloadData);
          $('#ContentValue').val(JSON.stringify(payloadData));
          $('#DisplayContent').empty();
          $('#DisplayContent').append(value.content);
        }
      }
    });
    if (error == true) {
      console.log('errorContent:', errorContent);
      alert(`Tồn tại giá trị ${errorContent.join(', ')} trong Content không hợp lệ !`);
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

const getEvent = async (key) => {
  try {
    const response = await superagent.post('/api/getevent').send({ key });
    return response.body;
  } catch (error) {
    throw new Error(error.message);
  }
};

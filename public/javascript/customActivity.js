'use strict';
const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
var tmpCustomContents = [];
var tmpIndexContent = null;
var ContentOption = '';
var DEFieldsKey = '';
var fieldSelected = '';
var eventDefinitionKey = '';

const onRender = () => {
  connection.trigger('ready');
  connection.trigger('requestTokens');
  connection.trigger('requestEndpoints');
  connection.trigger('requestInteraction');
  connection.trigger('requestSchema');

  $('#ContentOption').change(() => {
    $('#ContentBuilder').val('Loading...');
    checkContent('process');
  });

  $('#DEFieldsKey').change(() => {
    if ($('#DEFieldsKey').val()) {
      buttonSettings.enabled = true;
    } else {
      buttonSettings.enabled = false;
    }
    connection.trigger('updateButton', buttonSettings);
    $('#DEKeys').val(`{{Event.${eventDefinitionKey}.${$('#DEFieldsKey').val()}}}`);
  });

  $('#refreshButton').on('click', async () => {
    // console.log(tmpCustomContents.find(cont => cont.id == $("#ContentOption").val()));
    $('#ContentBuilder').val('Loading...');
    $('#ContentOption').empty();
    $('#ContentOption').append('<option value="None">Loading...</option>');
    $('#DisplayContent').empty();
    try {
      const customContent = await getCustomContent();
      tmpCustomContents = customContent.items;
      tmpIndexContent = null;
      $('#ContentOption').empty();
      $.each(tmpCustomContents, (index, content) => {
        $('#ContentOption').append(`<option value=${content.id}>${content.name}</option>`);
      });
      $('#ContentOption').val(ContentOption);
      checkContent('process');
    } catch (error) {
      alert(`Error on fetching data: ${error.message}`);
    }
  });
};

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
      if (key === 'ContentOption') {
        ContentOption = value;
      }
      if (key === 'DEFieldsKey') {
        DEFieldsKey = value;
      }
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
  //console.log(tokens);
  authTokens = tokens;
}

/**
 *
 *
 * @param {*} endpoints
 */
function onGetEndpoints(endpoints) {
  //console.log(endpoints);
}

/**
 * Save settings
 */
function save() {
  //payload.name = 'trung test';
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
      connection.trigger('updateButton', {
        button: 'next',
        visible: true,
      });
      connection.trigger('updateButton', {
        button: 'back',
        visible: false,
      });
      break;
    case 'step2':
      $('#step2').show();
      $('#titleDynamic').empty().append('Endpoint');
      $('#iconDynamic').attr('xlink:href', '/icons/standard-sprite/svg/symbols.svg#contact_list');
      connection.trigger('updateButton', {
        button: 'next',
        visible: true,
      });
      connection.trigger('updateButton', {
        button: 'back',
        visible: false,
      });
      break;
    case 'step3':
      $('#step3').show();
      $('#titleDynamic').empty().append('Data Extention');
      $('#iconDynamic').attr('xlink:href', '/icons/standard-sprite/svg/symbols.svg#contact_list');
      if ($('#DEFieldsKey').val()) {
        buttonSettings.enabled = true;
      } else {
        buttonSettings.enabled = false;
      }
      connection.trigger('updateButton', buttonSettings);
      connection.trigger('updateButton', {
        button: 'back',
        visible: false,
      });
      break;
    case 'step4':
      $('#step4').show();
      $('#titleDynamic').empty().append('Content');
      $('#iconDynamic').attr(
        'xlink:href',
        '/icons/standard-sprite/svg/symbols.svg#code_playground'
      );
      $('#ContentOption').append('<option value="None">Loading...</option>');
      connection.trigger('updateButton', {
        button: 'back',
        visible: true,
      });
      connection.trigger('updateButton', {
        button: 'next',
        text: 'done',
        visible: true,
        enabled: false,
      });
      try {
        const customContent = await getCustomContent();
        tmpCustomContents = customContent.items;
        tmpIndexContent = null;
        $('#ContentOption').empty();
        $.each(tmpCustomContents, (index, content) => {
          $('#ContentOption').append(`<option value=${content.id}>${content.name}</option>`);
        });
        $('#ContentOption').val(ContentOption);
        checkContent('init');
      } catch (error) {
        alert(`Error on fetching data: ${error.message}`);
      }
      break;
  }
};

function checkContent(type) {
  console.log('type: ' + type);
  var alerts = false;
  //var dataRex = type == 'process' ? value.content : $("#ContentBuilder").val();
  console.log($('#ContentBuilder').val());
  console.log('tmpCustomContents: ', tmpCustomContents);
  console.log('tmpIndexContent: ' + tmpIndexContent);
  if (tmpIndexContent !== null) {
    const payloadData = tmpCustomContents[tmpIndexContent].meta.options.customBlockData;
    console.log('payloadData', payloadData);
    $('#ContentBuilder').val(JSON.stringify(payloadData));
    $('#DisplayContent').empty();
    $('#DisplayContent').append(tmpCustomContents[tmpIndexContent].content);
  }
  if ($('#ContentOption').val() != '' && $('#ContentOption').val() != 'None') {
    console.log('ContentOption khong rong~:', $('#ContentOption').val());
    console.log($('#ContentBuilder').val());
    tmpCustomContents.forEach((value) => {
      if (value.id == $('#ContentOption').val()) {
        const regex = /%%([\s\S]*?)%%/gm;
        let m;
        while (
          (m = regex.exec(type == 'process' ? value.content : $('#ContentBuilder').val())) !== null
        ) {
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          if (!fieldSelected.includes(m[1])) {
            connection.trigger('updateButton', {
              button: 'next',
              enabled: false,
            });
            alerts = true;
          }
        }
        if (type == 'process') {
          tmpIndexContent = tmpCustomContents.indexOf(value);
          const payloadData = value.meta.options.customBlockData;
          console.log('payloadData', payloadData);
          $('#ContentBuilder').val(JSON.stringify(payloadData));
          $('#DisplayContent').empty();
          $('#DisplayContent').append(value.content);
        }
      }
    });
    if (alerts == true) {
      alert('Tồn tại giá trị ( %%<Field DE>%%) trong Content không hợp lệ ! ');
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

const requestedInteractionHandler = async (settings) => {
  console.log('--debug requestedInteractionHandler:');
  console.log('settings:', settings);
  try {
    eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
    //document.getElementById('select-entryevent-defkey').value = eventDefinitionKey;
    //console.log('eventDefinitionKey:' + JSON.stringify(settings));
    $('#DEFieldsKey').append('<option value="None">Loading...</option>');
    $('#DEFields').append('<p value="None"></p>Loading............</p>');
    $.ajax({
      url: `/api/getevent/`,
      data: { key: eventDefinitionKey },
      type: 'POST',
      // beforeSend: function (xhr) { xhr.setRequestHeader('X-Test-Header', 'SetHereYourValueForTheHeader'); },
      success: function (data) {
        console.log('data', data);
        //$(".js_de_lst").append('<h2 value="' +CustomerKey + '">' + data.dataExtention.Name + '</option>');
        $('.js_de_lst').append(`<p>${data.dataExtention.Name}</p>`);
        fieldSelected = data.deCol;
        $('#DEFields').empty();
        $('#DEFieldsKey').empty();
        $('#DEFieldsKey').append('<option value=""></option>');
        // DEFieldsKey
        fieldSelected.forEach((value) => {
          fieldSelected = value.Name + ' ' + fieldSelected;
          if ($('#DEFieldsKey').find(`option[value="${value.Name}"]`).length == 0) {
            $('#DEFieldsKey').append(`<option value=${value.Name}>${value.Name}</option>`);
          }
          if ($('#DEFields').find(`p[value="${value.CustomerKey}"]`).length == 0) {
            $('#DEFields').append(
              `<p value=${value.CustomerKey} id=${value.Name} class="js-activity-setting">${value.Name}</p>`
            );
          }
          $(`#${value.Name}`).val(`{{Event.${eventDefinitionKey}.${value.Name}}}`);
          if (DEFieldsKey) {
            $('#DEFieldsKey').val(DEFieldsKey);
            connection.trigger('updateButton', {
              button: 'next',
              enabled: true,
            });
          }
        });
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert('Please choose ENTRY EVENT and SAVE Journey before Continue');
        // connection.trigger('destroy');
      },
    });
    const response = await getEvent(eventDefinitionKey);
    console.log('response: ', response.body);
  } catch (error) {
    console.error(error);
    alert('superagent:', error.message);
  }
};

const getCustomContent = async () => {
  try {
    const response = await superagent.get('/api/getcustomcontent');
    return response.body;
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

const getEvent = async (key) => {
  try {
    const response = await superagent.post('/api/getevent').send({ key });
    return response.body;
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

$(window).ready(onRender);
connection.on('initActivity', initialize);
connection.on('requestedTokens', onGetTokens);
connection.on('requestedEndpoints', onGetEndpoints);
connection.on('requestedInteraction', requestedInteractionHandler);
connection.on('clickedNext', next);
connection.on('clickedBack', prev);
connection.on('gotoStep', onGotoStep);
connection.on('requestedSchema', function (data) {
  // save schema
  //console.log('*** Schema ***', JSON.stringify(data['schema']));
});
//connection.on('clickedNext', save);

var steps = [
  { label: 'Channel', key: 'step1' },
  { label: 'Endpoint', key: 'step2' },
  { label: 'Data', key: 'step3' },
  { label: 'Content', key: 'step4' },
];
var currentStep = steps[0].key;

const buttonSettings = {
  button: 'next',
  enabled: false,
};

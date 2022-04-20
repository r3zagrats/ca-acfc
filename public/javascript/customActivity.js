'use strict';

// const validateForm = function (cb) {
//     $form = $('.js-settings-form');
//     $form.validate({
//         submitHandler: function (form) {
//         },
//         errorPlacement: function () { },
//     });

//     cb($form);
// };
const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
let $form;
$(window).ready(onRender);
var tmpContent = [];
var tmpIndexContent = null;
var ContentOption = '';
var DEkeyField = '';
var fieldSelected = '';
var eventDefinitionKey = '';

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
  // initialize to the same value as what's set in config.json for consistency
  { label: 'Message Type', key: 'step1' },
  { label: 'Data', key: 'step2' },
  { label: 'Content', key: 'step3' },
];
var currentStep = steps[0].key;

const buttonSettings = {
  button: 'next',
  enabled: false,
};

function onRender() {
  connection.trigger('ready');
  connection.trigger('requestTokens');
  connection.trigger('requestEndpoints');
  connection.trigger('requestInteraction');
  connection.trigger('requestSchema');
  //trigger change value
  $('#ContentOption').change(function () {
    $('#ContentBuilder').val('Loading...');
    checkContent('process');
  });

  $('#DEkeyField').change(function () {
    if (
      $('#DEkeyField').val() != '' &&
      $('#DEkeyField').val() != 'None' &&
      $('#DEkeyField').val() != null
    ) {
      buttonSettings.enabled = true;
    } else {
      buttonSettings.enabled = false;
    }
    connection.trigger('updateButton', buttonSettings);
    $('#DataExKey').val('{{Event."' + eventDefinitionKey + '"."' + $('#DEkeyField').val() + '"}}');
  });

  $('#buttonRefresh').on('click', function () {
    // console.log(tmpContent.find(cont => cont.id == $("#ContentOption").val()));
    $('#ContentBuilder').val('Loading...');
    $('#ContentOption').empty();
    $('#ContentOption').append('<option value="None">Loading ...</option>');
    $('#DisplayContent').empty();
    $.ajax({
      url: `/api/getcustomcontent/`,
      type: 'GET',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('X-Test-Header', 'SetHereYourValueForTheHeader');
      },
      success: function (data) {
        tmpContent = data.items;
        tmpIndexContent = null;
        $('#ContentOption').empty();
        tmpContent.forEach((value) => {
          if ($('#ContentOption').find('option[value="' + value.id + '"]').length == 0) {
            $('#ContentOption').append(
              '<option value="' + value.id + '">' + value.name + '</option>'
            );
          }
        });
        $('#ContentOption').val(ContentOption);
        checkContent('process');
      },
    });
  });
  // validation
  // validateForm(function ($form) {
  //     // /change click keyup input paste
  //     $form.on('change paste', 'select, input, textarea', function () {
  //         buttonSettings.enabled = $form.valid();
  //         connection.trigger('updateButton', buttonSettings);
  //     });
  // });
}

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
  $.each(inArguments, function (index, inArgument) {
    $.each(inArgument, function (key, value) {
      const $el = $('#' + key);
      if ($el.attr('type') === 'checkbox') {
        $el.prop('checked', value === 'true');
      } else {
        $el.val(value);
      }
      if (key === 'ContentOption') {
        ContentOption = value;
      }
      if (key === 'DEkeyField') {
        DEkeyField = value;
      }
    });
  });
  console.log('inArguments After: ', inArguments);
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
  $('.js-activity-setting').each(function () {
    const $el = $(this);
    const setting = {
      id: $(this).attr('id'),
      value: $(this).val(),
    };
    $.each(payload['arguments'].execute.inArguments, function (index, value) {
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
  console.dir('payload: ', payload);
  connection.trigger('updateActivity', payload);
}

/**
 * Next settings
 */
function next() {
  if (currentStep.key === 'step3') {
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

function showStep(step, stepIndex) {
  if (stepIndex && !step) {
    step = steps[stepIndex - 1];
  }
  currentStep = step;
  $('.step').hide();

  switch (currentStep.key) {
    case 'step1':
      $('#step1').show();
      $('#titleDynamic').empty().append('Message Type');
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
      $('#titleDynamic').empty().append('Data Extention');
      $('#iconDynamic').attr('xlink:href', '/icons/standard-sprite/svg/symbols.svg#contact_list');
      if (
        $('#DEkeyField').val() != '' &&
        $('#DEkeyField').val() != 'None' &&
        $('#DEkeyField').val() != null
      ) {
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
    case 'step3':
      $('#step3').show();
      $('#titleDynamic').empty().append('Content');
      $('#iconDynamic').attr(
        'xlink:href',
        '/icons/standard-sprite/svg/symbols.svg#code_playground'
      );
      $('#ContentOption').append('<option value="None">Loading ...</option>');
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
      $.ajax({
        url: `/api/getcustomcontent/`,
        type: 'GET',
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-Test-Header', 'SetHereYourValueForTheHeader');
        },
        success: function (data) {
          console.log(data);
          tmpContent = data.items;
          $('#ContentOption').empty();
          tmpContent.forEach((value) => {
            if ($('#ContentOption').find('option[value="' + value.id + '"]').length == 0) {
              $('#ContentOption').append(
                '<option value="' + value.id + '">' + value.name + '</option>'
              );
            }
          });
          $('#ContentOption').val(ContentOption);
          checkContent('init');
        },
      });
      break;
  }
}

function checkContent(type) {
  console.log('type: ' + type);
  var alerts = false;
  //var dataRex = type == 'process' ? value.content : $("#ContentBuilder").val();
  console.log($('#ContentBuilder').val());
  console.log('tmpContent: ', tmpContent);
  console.log('tmpIndexContent: ' + tmpIndexContent);
  if (tmpIndexContent !== null) {
    const payloadData = tmpContent[tmpIndexContent].meta.options.customBlockData;
    console.log('payloadData', payloadData);
    $('#ContentBuilder').val(JSON.stringify(payloadData));
    $('#DisplayContent').empty();
    $('#DisplayContent').append(tmpContent[tmpIndexContent].content);
  }
  if ($('#ContentOption').val() != '' && $('#ContentOption').val() != 'None') {
    console.log('ContentOption khong rong~: ', $('#ContentOption').val());
    console.log($('#ContentBuilder').val());
    tmpContent.forEach((value) => {
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
          tmpIndexContent = tmpContent.indexOf(value);
          const payloadData = value.meta.options.customBlockData;
          console.log('payloadData', payloadData);
          $('#ContentBuilder').val(JSON.stringify(payloadData));
          $('#DisplayContent').empty();
          $('#DisplayContent').append(value.content);
        }
      }
    });
    if (alerts == true) {
      //$("#errorText").val("Giá trị ( %%<Field DE>%%) trong Content không hợp lệ ! ");
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

function requestedInteractionHandler(settings) {
  //console.log('--debug requestedInteractionHandler:');
  //what they are doig on this
  try {
    eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
    //document.getElementById('select-entryevent-defkey').value = eventDefinitionKey;
    //console.log('eventDefinitionKey:' + JSON.stringify(settings));
    $('#DEkeyField').append('<option value="None">Loading...</option>');
    $('#DEFields').append('<p value="None" >Loading............</p>');
    $.ajax({
      url: `/api/getevent/`,
      data: { key: eventDefinitionKey },
      type: 'GET',
      // beforeSend: function (xhr) { xhr.setRequestHeader('X-Test-Header', 'SetHereYourValueForTheHeader'); },
      success: function (data) {
        //$(".js_de_lst").append('<h2 value="' +CustomerKey + '">' + data.dataExtention.Name + '</option>');
        $('.js_de_lst').append('<p>' + data.dataExtention.Name + '</p>');
        fieldSelected = data.deCol;
        $('#DEFields').empty();
        $('#DEkeyField').empty();
        $('#DEkeyField').append('<option value=""></option>');
        // DEkeyField
        fieldSelected.forEach((value) => {
          fieldSelected = value.Name + ' ' + fieldSelected;
          if ($('#DEkeyField').find('option[value="' + value.Name + '"]').length == 0) {
            $('#DEkeyField').append(
              '<option value="' + value.Name + '">' + value.Name + '</option>'
            );
          }
          if ($('#DEFields').find('p[value="' + value.CustomerKey + '"]').length == 0) {
            $('#DEFields').append(
              '<p value="' +
                value.CustomerKey +
                '" id = "' +
                value.Name +
                '" class = "js-activity-setting">' +
                value.Name +
                '</p>'
            );
          }
          $('#' + value.Name).val('{{Event."' + eventDefinitionKey + '"."' + value.Name + '"}}');
          if (DEkeyField != '' && DEkeyField != 'None' && DEkeyField != null) {
            $('#DEkeyField').val(DEkeyField);
            connection.trigger('updateButton', {
              button: 'next',
              enabled: true,
            });
          }
        });
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert('Please choose ENTRY EVENT and SAVE Journey before Continue');
        connection.trigger('destroy');
      },
    });
  } catch (err) {
    console.error(err);
  }
}

$(window).ready(onRender);
function onRender() {
  //table
  // $('[data-toggle="tooltip"]').tooltip();
  // var actions = $("table td:last-child").html();
  $('.add-new').on('click', function () {
    $('.modal-body').empty();
    $('.modal-body').append('<label for="fname">Id:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="_id"  value="None" disabled ><br>'
    );
    $('.modal-body').append('<label for="fname">Name:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="name" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">Method:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="method" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">URI:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="uri" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">Auth URL:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="authUrl" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">App Id:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="appId" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">App Secret Key:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="appSecretKey" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">codeVerifier:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="codeVerifier" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">codeChallenge:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="codeChallenge" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">accessToken:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="accessToken" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">expiresTime:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="expiresTime" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">refreshToken:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="refreshToken" value="" required><br>'
    );
    $('.modal-body').append('<label for="fname">Header:</label><br>');
    $('.modal-body').append(
      '<textarea class="form-control" id="header" rows="10" required placeholder="" name="text"></textarea><br>'
    );
    $('#myModal').modal('show');
  });

  // Edit row on edit button click
  $(document).on('click', '.edit', function () {
    var rowdata = [];
    $(this)
      .parents('tr')
      .find('td:not(:last-child)')
      .each(function () {
        rowdata.push($(this).text());
      });
    var data = {
      name: rowdata[0],
      uri: rowdata[1],
      authUrl: rowdata[2],
      method: rowdata[3],
      header: rowdata[4],
      _id: rowdata[5],
      appId: rowdata[6],
      appSecretKey: rowdata[7],
      codeVerifier: rowdata[8],
      codeChallenge: rowdata[9],
      accessToken: rowdata[10],
      expiresTime: rowdata[11],
      refreshToken: rowdata[12],
    };
    console.log(data);
    $('.modal-body').empty();
    $('.modal-body').append('<label for="fname">Id:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="_id"  value="' + data._id + '" disabled ><br>'
    );
    $('.modal-body').append('<label for="fname">Name:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="name" value="' + data.name + '" required><br>'
    );
    $('.modal-body').append('<label for="fname">Method:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="method" value="' +
        data.method +
        '" required><br>'
    );
    $('.modal-body').append('<label for="fname">URI:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="uri" value="' + data.uri + '" required><br>'
    );
    $('.modal-body').append('<label for="fname">Auth URL:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="authUrl" value="' +
        data.authUrl +
        '" required><br>'
    );
    $('.modal-body').append('<label for="fname">App Id:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="appId" value="' + data.appId + '" required><br>'
    );
    $('.modal-body').append('<label for="fname">App Secret Key:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="appSecretKey" value="' +
        data.appSecretKey +
        '" required><br>'
    );
    $('.modal-body').append('<label for="fname">codeVerifier:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="codeVerifier" value="' +
        data.codeVerifier +
        '" required><br>'
    );
    $('.modal-body').append('<label for="fname">codeChallenge:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="codeChallenge" value="' +
        data.codeChallenge +
        '" required><br>'
    );
    $('.modal-body').append('<label for="fname">accessToken:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="accessToken" value="' +
        data.accessToken +
        '" required><br>'
    );
    $('.modal-body').append('<label for="fname">expiresTime:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="expiresTime" value="' +
        data.expiresTime +
        '" required><br>'
    );
    $('.modal-body').append('<label for="fname">refreshToken:</label><br>');
    $('.modal-body').append(
      '<input type="text" class="form-control" id="refreshToken" value="' +
        data.refreshToken +
        '" required><br>'
    );
    $('.modal-body').append('<label for="fname">Header:</label><br>');
    $('.modal-body').append(
      '<textarea class="form-control" id="header" rows="10" required placeholder="" name="text"></textarea><br>'
    );
    $('#header').val(data.header);
    $('#myModal').modal('show');
    //$(".add-new").attr("disabled", "disabled");
  });
  // Delete row on delete button click
  $(document).on('click', '.delete', function () {
    var rowdata = [];
    $(this)
      .parents('tr')
      .find('td:not(:last-child)')
      .each(function () {
        rowdata.push($(this).text());
      });
    var data = {
      name: rowdata[0],
      uri: rowdata[1],
      authUrl: rowdata[2],
      method: rowdata[3],
      header: rowdata[4],
      _id: rowdata[5],
      appId: rowdata[6],
      appSecretKey: rowdata[7],
      codeVerifier: rowdata[8],
      codeChallenge: rowdata[9],
      accessToken: rowdata[10],
      expiresTime: rowdata[11],
      refreshToken: rowdata[12],
    };
    deleRow(data);
    $(this).parents('tr').remove();
  });
  //Save Row
  $(document).on('click', '.save', function () {
    let payload = {};
    let err = '';
    $('.form-control').each(function () {
      const $el = $(this);
      if ($(this).attr('id') == 'header') {
        try {
          payload[$(this).attr('id')] =
            $(this).val() == '' ? $(this).val() : JSON.parse($(this).val());
        } catch (e) {
          err = 'Header is not of type json';
        }
      } else payload[$(this).attr('id')] = $(this).val();
    });
    console.log(payload);
    if (err == '') {
      upSert(payload);
    } else alert(err);
  });
}

function upSert(payload) {
  console.log(payload);
  if (payload._id != 'None') {
    $.ajax({
      url: `/db/service/`,
      type: 'PUT',
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          'Authorization',
          `JWT 8cKsTUl-zmIDp3rAioR6rIe0mCgk8wb8ZwjhCIrKHOPb5MHN_ZTUSv0r7xtMK0Z97wltUr_saclH-sQC9GVJzb9DCQRuj7wqoYZGsFDgp6DaX9zeWxeC1RS5G7LHnXnJfmy7KTKEjIduC1F_CWeXzmRUOfxxyRYfRTUtlwvXrPZi5xLzYekdtPeRJKxr5hqwFLWdz4QSJ5r0TgxfCWdfb7tqv8V5guG2znoUBikfbxNWlpdpGZ75ZNQCcutByw2`
        );
      },
      data: JSON.stringify(payload),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        $('#myModal').modal('hide');
        location.reload();
      },
      error: function (data) {
        alert('Error Update: ', data);
      },
    });
  } else {
    delete payload['_id'];
    $.ajax({
      url: `/db/service/`,
      type: 'POST',
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          'Authorization',
          `JWT 8cKsTUl-zmIDp3rAioR6rIe0mCgk8wb8ZwjhCIrKHOPb5MHN_ZTUSv0r7xtMK0Z97wltUr_saclH-sQC9GVJzb9DCQRuj7wqoYZGsFDgp6DaX9zeWxeC1RS5G7LHnXnJfmy7KTKEjIduC1F_CWeXzmRUOfxxyRYfRTUtlwvXrPZi5xLzYekdtPeRJKxr5hqwFLWdz4QSJ5r0TgxfCWdfb7tqv8V5guG2znoUBikfbxNWlpdpGZ75ZNQCcutByw2`
        );
      },
      data: JSON.stringify(payload),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        $('#myModal').modal('hide');
        location.reload();
      },
      error: function (data) {
        alert('Error Insert: ', data);
      },
    });
  }
}

function deleRow(payload) {
  $.ajax({
    url: `/db/service/`,
    type: 'DELETE',
    beforeSend: function (xhr) {
      xhr.setRequestHeader(
        'Authorization',
        `JWT 8cKsTUl-zmIDp3rAioR6rIe0mCgk8wb8ZwjhCIrKHOPb5MHN_ZTUSv0r7xtMK0Z97wltUr_saclH-sQC9GVJzb9DCQRuj7wqoYZGsFDgp6DaX9zeWxeC1RS5G7LHnXnJfmy7KTKEjIduC1F_CWeXzmRUOfxxyRYfRTUtlwvXrPZi5xLzYekdtPeRJKxr5hqwFLWdz4QSJ5r0TgxfCWdfb7tqv8V5guG2znoUBikfbxNWlpdpGZ75ZNQCcutByw2`
      );
    },
    data: JSON.stringify(payload),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: function (data) {
      $('#myModal').modal('hide');
      location.reload();
    },
    error: function (data) {
      alert('Error: ', data);
    },
  });
}

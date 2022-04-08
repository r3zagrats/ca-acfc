$(window).ready(onRender);
function onRender() {
  $('.add-new').on('click', () => {
    formRender();
  });

  // Edit row on edit button click
  $(document).on('click', '.edit', function() {
    var rowdata = [];
    $(this)
      .parents('tr')
      .find('td:not(:last-child)')
      .each(function () {
        rowdata.push($(this).text());
      });
    var data = {
      OAName: rowdata[0],
      OAId: rowdata[1],
      AccessToken: rowdata[2],
      RefreshToken: rowdata[3],
      Timestamp: rowdata[4],
      ExpiryDate: rowdata[5],
    };
    formRender(data);
  });

  // Delete row on delete button click
  $(document).on('click', '.delete', function() {
    const thisId = $(this).parents('tr').find('td:nth-child(2)')[0].innerText;
    deleteData(thisId);
    $(this).parents('tr').remove();
  });

  //Save Row
  $(document).on('click', '.save', async () => {
    let data = {};
    $('.form-control').each(function () {
      data[$(this).attr('id')] = $(this).val();
    });
    // Update OA
    if ($('#hasData').length === 1) upsertData(data, true);
    // Create new OA
    else {
      const thisId = $('#OAId').val();
      let result = await isValidId(thisId);
      if (thisId === '') {
        alert('OAId is required');
      } else if (result === false) {
        alert('Id này đã tồn tại');
      } else {
        insertData(data);
      }
    }
  });
}

/**
 * Upsert data
 * @param {object} data
 * @param {boolean} hasData
 */
const upsertData = async (data, hasData) => {
  console.log(data);
  try {
    const result = await superagent
      .patch('/pgdb/zalooa')
      .set('Accept', 'application/json')
      .send({ data: JSON.stringify(data) });
    location.reload();
  } catch (error) {
    alert('Error on delete: ', error);
  }
};

/**
 * Insert data
 * @param {object} data
 * @param {boolean} hasData
 */
const insertData = async (data, hasData) => {
  console.log(data);
  try {
    let result = await superagent
      .post('/pgdb/zalooa')
      .set('Accept', 'application/json')
      .send({ data: JSON.stringify(data) });
    location.reload()
  } catch (error) {
    alert('Error on delete: ', error);
  }
};

/**
 *  Delete data
 * @param {string} id
 */
const deleteData = async (id) => {
  try {
    const result = await superagent.delete('/pgdb/zalooa').send({
      id,
    });
    location.reload();
  } catch (error) {
    alert(`Error on delete: ${error}`);
  }
};

/**
 * Check is valid Id
 * @param {string} id
 */
const isValidId = async (id) => {
  try {
    let result = await superagent.get(`/pgdb/zalooa/${id}`);
    result = JSON.parse(result.text);
    const resultId = result.data[0].OAId;
    if (id === resultId) return false;
    else return true;
  } catch (error) {
    alert('Error on delete: ', error);
  }
};

/**
 * Render form
 * @param {object} data 
 */
const formRender = (data) => {
  $('.modal-body').empty();
  $('.modal-body').append('<label for="OAId">OA Id:</label><br>');
  $('.modal-body').append(
    '<input type="text" class="form-control" id="OAId" value="' +
      (data ? data.OAId : '') +
      '" required><br>'
  );
  $('.modal-body').append('<label for="OAName">OA Name:</label><br>');
  $('.modal-body').append(
    '<input type="text" class="form-control" id="OAName" value="' +
      (data ? data.OAName : '') +
      '" required><br>'
  );
  $('.modal-body').append('<label for="accessToken">Access Token:</label><br>');
  $('.modal-body').append(
    '<input type="text" class="form-control" id="AccessToken" value="' +
      (data ? data.AccessToken : '') +
      '" required><br>'
  );
  $('.modal-body').append('<label for="refreshToken">Refresh Token:</label><br>');
  $('.modal-body').append(
    '<input type="text" class="form-control" id="RefreshToken" value="' +
      (data ? data.RefreshToken : '') +
      '" required><br>'
  );
  $('.modal-body').append('<label for="timestamp">Timestamp:</label><br>');
  $('.modal-body').append(
    '<input type="text" class="form-control" id="Timestamp" value="' +
      (data ? data.Timestamp : '') +
      '" required><br>'
  );
  $('.modal-body').append('<label for="expiryDate">Expiry Date:</label><br>');
  $('.modal-body').append(
    '<input type="text" class="form-control" id="ExpiryDate" value="' +
      (data ? data.ExpiryDate : '') +
      '" required><br>'
  );
  if (data) {
    $('#OAId').attr('disabled', true);
    $('.modal-body').append('<div id="hasData"></div>');
  }
  $('#myModal').modal('show');
};

$(window).ready(onRender);
function onRender() {
  $(document).on("click", "#changepass", function () {
    $("#modalPass").modal("show");
  });
  $(document).on("click", "#savePass", function () {
    if (
      $("#inputPasswordNew").val() === $("#inputPasswordNewVerify").val() &&
      $("#inputPasswordNew").val() != null &&
      $("#inputPasswordNew").val() != ""
    ) {
      $.ajax({
        url: `/db/user/`,
        type: "PUT",
        beforeSend: function (xhr) {
          xhr.setRequestHeader(
            "Authorization",
            `JWT 8cKsTUl-zmIDp3rAioR6rIe0mCgk8wb8ZwjhCIrKHOPb5MHN_ZTUSv0r7xtMK0Z97wltUr_saclH-sQC9GVJzb9DCQRuj7wqoYZGsFDgp6DaX9zeWxeC1RS5G7LHnXnJfmy7KTKEjIduC1F_CWeXzmRUOfxxyRYfRTUtlwvXrPZi5xLzYekdtPeRJKxr5hqwFLWdz4QSJ5r0TgxfCWdfb7tqv8V5guG2znoUBikfbxNWlpdpGZ75ZNQCcutByw2`
          );
        },
        data: JSON.stringify({
          username: "Admin",
          pass: $("#inputPasswordNew").val(),
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
          $("#modalPass").modal("hide");
        },
        error: function (data) {
          alert("Error Update: ", data);
        },
      });
    } else {
      alert("Sai pass rồi thằng ngu");
    }
  });
}

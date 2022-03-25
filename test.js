const content = `<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="min-width: 100%; " class="stylingblock-content-wrapper"><tr><td class="stylingblock-content-wrapper camarker-inner">
<div style="background-color: #90caf9; min-height: 100vh; display: flex; padding: 20px">
  <div id="msgBlock" style="
    width: 360px;
    margin: auto;
    border-radius: 5px;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
  ">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFPk9YaLQjhWcGl8Yhs-hxw0Rp-rc-y0cSPw&usqp=CAU" alt="msgImage" style="
        width:100%; 
        height: 232px;
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
      ">
    <p style="
        padding: 10px;
        margin: 0;
        margin-bottom: 2px;
        background-color: white;
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
        font-size: 110%;
        margin-top: -4px;
        word-wrap: break-word;
      ">
    Good afternoon %%Name%%
    </p>
  </div>
</div>
<!--Payload 
{ 
  "recipient": {
    "user_id": %%ZaloId%%
  },
  "message": {
    "text": "Good afternoon       
    %%Name%%",
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "media",
        "elements": [{
          "media_type": "image",
          "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFPk9YaLQjhWcGl8Yhs-hxw0Rp-rc-y0cSPw&usqp=CAU"
        }]
      }
    }
  }            
}
Payload-->
</td></tr></table>`
const regex = /(?<=<!--Payload)[\s\S]*(?=Payload-->)/gm;
const payloadData = (regex.exec(content)[0])
console.log(payloadData);
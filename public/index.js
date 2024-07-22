let imgFile;

async function uploadImage(event) {
  let file = event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  let fileType = file.type;
  console.log(fileType);
  if (
    fileType !== "image/jpeg" &&
    fileType !== "image/jpg" &&
    fileType !== "image/png"
  ) {
    alert("只能上傳 JPG 或 PNG 檔案圖片!");
    return;
  }

  imgFile = file; // 确保在成功的情况下设置 imgFile
}

async function submitForm(file) {
  const message = document.querySelector("#paragraph").value;
  let formData = new FormData();
  formData.append("file", file);
  formData.append("message", message);

  try {
    let response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    let getUploadInfo = await response.json();
    console.log(getUploadInfo);
    if (!response.ok) {
      console.error("HTTP error", response.status);
      alert(getUploadInfo.message);
      return;
    } else {
      refreshView();
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Failed to upload file.");
  }
}

async function refreshView() {
  const container = document.querySelector(".post-wrapper");
  container.innerHTML = "";
  const response = await fetch("/api/getFullBoard");
  const data = await response.json();
  console.log(data);
  data.data.forEach((d) => {
    const html = `<div>
                <p>${d.message}</p>
                <img src="${d.img_url}">
            </div>
            <hr>`;
    container.insertAdjacentHTML("afterBegin", html);
  });
}

async function init() {
  document.querySelector("#figure").addEventListener("change", (e) => {
    uploadImage(e);
  });

  document.querySelector(".post-form").addEventListener("submit", (e) => {
    e.preventDefault();
    submitForm(imgFile); // 确保将 imgFile 传递给 submitForm 函数
  });

  await refreshView();
}

init();

let loading_line;

window.onload = () => {
  loading_line = document.getElementById("loading-line");
};

window.onscroll = (e) => {
  let d_height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  let percentage = (window.scrollY / d_height) * 100;
  loading_line.style.width = percentage + "%";
};

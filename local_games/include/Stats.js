var Stats = function () {
  var mode = 0;
  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
  var msDiv = document.createElement('div');
  msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background:#002;color:#0f0;font:10px monospace';
  container.appendChild(msDiv);
  var msText = document.createElement('div');
  msText.style.cssText = 'color:#0f0;font:10px monospace';
  msText.innerHTML = '--';
  msDiv.appendChild(msText);
  document.body.appendChild(container);
  return {
    domElement: container,
    update: function () {
      msText.innerHTML = '--';
    }
  };
};

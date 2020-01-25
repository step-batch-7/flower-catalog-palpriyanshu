const hideJar = function() {
  const jar = document.getElementById('jar');
  jar.classList.add('hide');
  setTimeout(() => jar.classList.remove('hide'), 1000);
};

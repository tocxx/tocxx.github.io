let mousePosition,
  offset = [0, 0],
  isDown = false;
[...document.getElementsByClassName("draggable")].forEach((element) => {
  element.addEventListener(
    "mousedown",
    (e) => {
      isDown = true;
      offset = [element.offsetLeft - e.clientX, element.offsetTop - e.clientY];
    },
    true
  );

  document.addEventListener(
    "mouseup",
    () => {
      isDown = false;
    },
    true
  );

  element.addEventListener(
    "mousemove",
    (e) => {
      e.preventDefault();
      if (isDown) {
        mousePosition = {
          x: e.clientX,
          y: e.clientY,
        };
        element.style.left = mousePosition.x + offset[0] + "px";
        element.style.top = mousePosition.y + offset[1] + "px";
      }
    },
    true
  );
});


document.querySelector("button").addEventListener("click", function(){
  var image = document.querySelector('.myP').getAttribute("src");
  if(image == "images/me.JPG"){
    document.querySelector(".myP").setAttribute("src","images/empty.JPG")
  }
  else{
    document.querySelector(".myP").setAttribute("src","images/me.JPG")
  }
})

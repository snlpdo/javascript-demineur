function dessiner() {
  // Couleurs utiles
  const GRIS_MOYEN = "rgb(175,175,175)"; // cellule non-jouée
  const GRIS_CLAIR = "rgb(225,225,225)"; // cellule jouée (et vide)
  const GRIS_FONCE = "rgb(100,100,100)"; // cellule jouée (et mine)

  // Récupérer le pinceau
  let canvas = document.querySelector("#moncanvas");
  let pinceau = canvas.getContext("2d");

  pinceau.fillStyle = GRIS_MOYEN;
  for (let i=1; i<=4; i+=1) { // Boucle sur les lignes (=ordonnées)
    for (let j=1; j<=5; j+=1) { // Boucle sur les colonnes (=abscisses)
      pinceau.fillRect(2+50*j,2+50*i,46,46);
    }
  }

  // Légendes
  pinceau.font = '20pt comicsans';
  pinceau.fillStyle = 'black';

  const legendeH = " ABCDE";
  for (let j=1; j<=5; j+=1) {
    pinceau.fillText(legendeH[j], 50*j+15, 40);
  }

  const legendeV = " 1234";
  for (let i=1; i<=4; i+=1) {
    pinceau.fillText(legendeV[i], 20, 50*i+35);
  }

  // Capturer l'événement mousedown
  canvas.addEventListener('mousedown', gestionClick);
}

function gestionClick(event) {
  let x = event.offsetX;
  let y = event.offsetY;

  let colonne = Math.floor(x/50);
  let ligne = Math.floor(y/50);

  if (colonne<=0 || colonne>=6 || ligne<=0 || ligne>=5) {
    return;
  }

  const legendeH = " ABCDE";
  const legendeV = " 1234";
  let coup = legendeH[colonne] + legendeV[ligne];

  console.log(coup);
}
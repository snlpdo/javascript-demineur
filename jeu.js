var pinceau, affichage, voisinage, canvas;

function init_jeu() {
  // Initialisation du jeu
  let init = initDemineur(5,4,3);
  affichage = init[1];
  voisinage = init[0];

  // Récupérer le pinceau
  canvas = document.querySelector("#moncanvas");
  pinceau = canvas.getContext("2d");
  // Capturer l'événement mousedown
  canvas.addEventListener('mousedown', gestionClick);
  // Supprimer le menu contextuel
  canvas.addEventListener('contextmenu', canvas.fn1 = e=> { e.preventDefault(); });

  dessiner();
}

function dessiner() {
  // Couleurs utiles
  const GRIS_MOYEN = "rgb(175,175,175)"; // cellule non-jouée
  const GRIS_CLAIR = "rgb(225,225,225)"; // cellule jouée (et vide)
  const GRIS_FONCE = "rgb(100,100,100)"; // cellule jouée (et mine)


  // Motif d'une mine (Path2D)
  let mine = new Path2D();
  mine.arc(25,25,10,0,Math.PI*2); // cercle de rayon 10 centré en (25,25)
  mine.moveTo(12,12); mine.lineTo(38,38); // diagonale 1
  mine.moveTo(12,38); mine.lineTo(38,12); // diagonale 2
  mine.moveTo(25,8); mine.lineTo(25,42); // trait vertical

  // Motif d'un drapeau (Path2D)
  let drapeau = new Path2D();
  drapeau.moveTo(8,42); drapeau.lineTo(8,8); // trait vertical
  drapeau.lineTo(25,16); drapeau.lineTo(8,24); // triangle

  // Dessiner le plateau
  pinceau.font = '15pt comicsans';
  for (let i=1; i<=4; i+=1) { // Boucle sur les lignes (=ordonnées)
    for (let j=1; j<=5; j+=1) { // Boucle sur les colonnes (=abscisses)
      // Couleur de la case courante
      if (affichage[i][j]==-1) {
        pinceau.fillStyle = GRIS_FONCE; 
      } else if(affichage[i][j]>=0 && affichage[i][j]<=8) {
          pinceau.fillStyle = GRIS_CLAIR;
      } else if(affichage[i][j]>=10) {
          pinceau.fillStyle = GRIS_MOYEN; 
      }

      // Dessiner la case
      pinceau.fillRect(2+50*j,2+50*i,46,46);

      ///// Décoration de la cellule /////
      // Étape 1
      pinceau.save();
      // Étape 2
      pinceau.translate(j*50, i*50); // case ligne i colonne j
      // Étape 3 
      pinceau.fillStyle = "black";
      pinceau.lineWidth = 3;
      pinceau.font = "15pt comicsans";
      if (affichage[i][j]==-1) { // Présence d'une mine
          pinceau.stroke(mine); // contour de la mine
          pinceau.fill(mine); // remplissage de la mine    
      } else if (affichage[i][j]>0 && affichage[i][j]<=8) { // Mine(s) voisine(s)
          pinceau.fillText(affichage[i][j], 18,32);
      } else if(affichage[i][j]>=11) {
          pinceau.stroke(drapeau); // contour du drapeau
          pinceau.fill(drapeau); // remplissage du drapeau
          if (affichage[i][j]==12) {
              pinceau.fillText("?", 25,42);
          }
      }

      // Étape 4
      pinceau.restore();
      
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

  //console.log(coup);

  // Identification du bouton de souris
  if (event.button==1) { // clic milieu
    return;
  }
  commande = event.button+1;

  // Appel de la fonction interne
  let mine = gestionCoup(coup, commande, affichage, voisinage);

  // Situation 1
  if (mine) {
      fin(false);
  }

  // Situation 2
  if (partieGagnee(affichage, voisinage)) {
      fin(true);
  }

  // Mise à jour de l'affichage
  dessiner();
}

function fin(res) {
   // Réinitialisation la gestions des événements.
   canvas.removeEventListener('mousedown', gestionClick);
   canvas.removeEventListener('contextmenu', canvas.fn1);
   
   // Afficher les mines
   for (let i=1; i<=4; i+=1) { // Boucle sur les lignes
     for (let j=1; j<=5; j+=1) { // Boucle sur les colonnes
       if (voisinage[i][j]==9) { // Présence d'une mine
           affichage[i][j] = -1; // L'afficher
       }
     }
   }
    
   let resultat = document.querySelector("#resultat");
    if (res) {
        resultat.innerHTML = "Gagné !";
    } else {
        resultat.innerHTML = "Perdu !";
    }
}
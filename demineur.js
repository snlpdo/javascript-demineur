/**
Version 1.0 - 2 février 2019

Moteur du jeu de démineur en JavaScript

author: R. Grosbois, NSI Vizille
*/

/**
   Initialiser les 2 tables du jeu:
   - table de voisinage
   - table d'affichage
   
   Chaque table a 2 colonnes et 2 lignes de plus pour gérer les effets
   de bords (mais aucune mine ne se trouve sur ces bords).
*/
function initDemineur(nCol=5, nLignes=4,nbMines=3) {
	// Positions aléatoire des mines
	let pos = [];
	for(let i=0; i<nCol*nLignes; i++) {
	    pos.push(i);
	}
	shuffle(pos);

	// Tableau temporaire pour positionner aléatoirement les mines 
	// (nb_mines en tout)
	// 0: pas de mine (ou bordure)
	// 1: 1 mine 
	let mines = create2Darray(nLignes+2, nCol+2, 0);
  for (let i=0; i<nbMines; i++) {
      let index = pos.pop();
      let ligne = Math.floor(index/nCol);
      let colonne = index%nCol;
      mines[ligne+1][colonne+1] = 1;
  }

  // Table de voisinage:
  // - 0 à 8: nombre de mines voisines
  // - 9: cellule en bordure ou contenant une mine
  let voisinage = create2Darray(nLignes+2, nCol+2, 9);
  for (let i=1; i<nLignes+1; i++) {
      for (let j=1; j<nCol+1; j++) {
          if (mines[i][j]===0) {
              let somme = 0;
              somme += mines[i-1][j-1];
              somme += mines[i-1][j];
              somme += mines[i-1][j+1];
              somme += mines[i][j-1];
              somme += mines[i][j+1];
              somme += mines[i+1][j-1];
              somme += mines[i+1][j];
              somme += mines[i+1][j+1];
              voisinage[i][j] = somme;
          }
      }
  }

  // Contenu de chaque cellule à afficher:
  // -1: mine découverte (partie perdue)
  // 0 à 8 : Nombre de mines voisine (cellule jouée)
 	// 10: cellule non jouée
  // 11: drapeau pour mine certaine
  // 12: drapeau pour mine incertaine
  let affichage = create2Darray(nLignes+2,nCol+2,10);

  return [voisinage, affichage];
}

    
/**
La position doit être valide et fournie au format '<col><ligne>' 
(ex: H4) et la commande vaut une des valeurs suivantes:
    - 1 pour creuser
    - 20 pour supprimer une annotation
    - 21 pour annoter avec une certitude (drapeau)
    - 22 pour annoter avec une incertitude
    - 3 pour basculer l'annotation entre successivement 
      non joué/drapeau/incertain 

Cette fonction revoit true si la partie est perdue, false sinon
*/
function gestionCoup(position, commande, affichage, voisinage) {
    position = position.toUpperCase();
    // Retrouver les indices de colonnes et lignes
    i = position.charCodeAt(1) -  '1'.charCodeAt(0) +1;
    j = position.charCodeAt(0) -  'A'.charCodeAt(0) +1;
    
    if (commande===1) { // creuser
        // Impossible si case jouée ou annotée
        if (affichage[i][j] !== 10) {
            return false;
        }
        if (voisinage[i][j]===9) { // mine présente
            affichage[i][j]=-1;
            return true; // Partie perdue
        } else { // pas de mine
            affichage[i][j]=voisinage[i][j];
            if (affichage[i][j]===0) {
                propagationZero(i,j,affichage,voisinage);
            }
        }
    } else if (commande===20) { // supprimer annotation
        // Seulement si case non jouée
        if (affichage[i][j]<10) {
            return false;
        } else { 
            affichage[i][j] = 10;
        }
    } else if (commande===21) { // poser un drapeau
        // Seulement si case non jouée
        if (affichage[i][j]<10) {
            return false;
        } else { 
        	affichage[i][j] = 11;
        }
    } else if (commande===22) { // indiquer une incertitude
        // Seulement si case non jouée
        if (affichage[i][j]<10) {
            return false;
        } else {
            affichage[i][j] = 12;
        }
    } else if (commande===3) { // basculer
        // Seulement si case non jouée
        if (affichage[i][j]<10) {
            return false;
        } else if (affichage[i][j]===10) {
            affichage[i][j] = 11;
        } else if (affichage[i][j]===11) {
            affichage[i][j] = 12;
        } else if (affichage[i][j]===12) {
            affichage[i][j] = 10;
        }
    }
    return false;
}

/**
Teste si la partie est gagnée. Pour cela, il faut:
    - toutes les cases jouées (annotées ou creusées).
    - toutes les mines annotées par un drapeau.

Retourne true si la partie est gagnée, false sinon
*/
function partieGagnee(affichage,voisinage) {
    // Toutes les cases ont été jouées ?
    for (let i=0; i<affichage.length-2; i++) {
        for (let j=0; j< affichage[i].length-2; j++) {
            if (affichage[i+1][j+1]===10) {
                return false;
            }
        }
    }
            
    // Toutes les mines ont été annotées ?
    for (let i=0; i<affichage.length-2; i++) {
        for (let j=0; j< affichage[i].length-2; j++) {
            if (voisinage[i+1][j+1]===9 && affichage[i+1][j+1]!==11) {
                return false;
            }
        }
    }
    return true;
}

///////////////////////////////////////
// Les fonctions ci-après servent au //
// fonctionnement interne et ne      //
// devraient pas avoir besoin d'être //
// appelées depuis votre code        //
///////////////////////////////////////

/*
 Rendre aléatoire un tableau
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Créer un tableau 2D initialisé à val
function create2Darray(nl, nc, val) {
    let a = [];
    for (let i=0; i<nl; i++) {
        a[i] = [];
        for (let j=0; j<nc; j++) {
            a[i][j] = val;
        }
    }
    return a;
}

/*
Algorithme récursif de propagation du voisinage nul.
(=0 mines dans le voisinage)
*/
function propagationZero(i,j,p,v) {
    p[i][j]=0;
    // Dévoiler le nombre de mines de chaque voisin non annoté
    if (p[i-1][j-1]<11 && v[i-1][j-1]!==0) { 
        p[i-1][j-1] = v[i-1][j-1];
    }
    if (p[i-1][j]<11 && v[i-1][j]!==0) {
        p[i-1][j] = v[i-1][j];
    }
    if (p[i-1][j+1]<11 && v[i-1][j+1]!==0) { 
        p[i-1][j+1] = v[i-1][j+1];
    }
    if (p[i][j-1]<11 && v[i][j-1]!==0) {
        p[i][j-1] = v[i][j-1];
    }
    if (p[i][j+1]<11 && v[i][j+1]!==0) { 
        p[i][j+1] = v[i][j+1];
    }
    if (p[i+1][j-1]<11 && v[i+1][j-1]!==0) { 
        p[i+1][j-1] = v[i+1][j-1];
    }
    if (p[i+1][j]<11 && v[i+1][j]!==0) { 
        p[i+1][j] = v[i+1][j];
    }
    if (p[i+1][j+1]<11 && v[i+1][j+1]!==0) { 
        p[i+1][j+1] = v[i+1][j+1];
    }

    // Propagation récursive
    if (v[i-1][j-1]===0 && p[i-1][j-1]!==0) {
        propagationZero(i-1,j-1,p,v);
    }
    if (v[i-1][j]===0 && p[i-1][j]!==0) {
        propagationZero(i-1,j,p,v);
    }
    if (v[i-1][j+1]===0 && p[i-1][j+1]!==0) {
        propagationZero(i-1,j+1,p,v);
    }
    if (v[i][j-1]===0 && p[i][j-1]!==0) {
        propagationZero(i,j-1,p,v);
    }
    if (v[i][j+1]===0 && p[i][j+1]!==0) {
        propagationZero(i,j+1,p,v);
    }
    if (v[i+1][j-1]===0 && p[i+1][j-1]!==0) {
        propagationZero(i+1,j-1,p,v);
    }
    if (v[i+1][j]===0 && p[i+1][j]!==0) {
        propagationZero(i+1,j,p,v);
    }
    if (v[i+1][j+1]===0 && p[i-1][j+1]!==0) {
        propagationZero(i+1,j+1,p,v);
    }
}

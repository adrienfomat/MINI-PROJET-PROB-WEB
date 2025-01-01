// GIDE AZANGUE FOMAT && SOUMAYA NAFIA

// === constants ===
const MAX_QTY = 9;
const productIdKey = "product";
const orderIdKey = "order";
const inputIdKey = "qte";

// === global variables  ===
// the total cost of selected products 
var total = 0;

// Panier management
var panier = [];

// function called when page is loaded, it performs initializations 
var init = function () {
    createShop();
    
    // Charger le panier depuis localStorage
    loadPanier();

    // ajout du gestionnaire d'evenement keyup à l'element #filter
    var filterInput = document.getElementById("filter");
    filterInput.addEventListener("keyup", filterProducts);

    // Ajouter un gestionnaire d'événements pour le bouton de sauvegarde
    var saveButton = document.getElementById("savePanierButton");
    saveButton.addEventListener("click", savePanier);
}
window.addEventListener("load", init);

// fonction pour sauvegarder le panier dans localStorage
var savePanier = function () {
    localStorage.setItem("panier", JSON.stringify(panier));
    alert("Panier sauvegardé !");
}

// fonction pour charger le panier depuis localStorage
var loadPanier = function () {
    var savedPanier = localStorage.getItem("panier");
    if (savedPanier) {
        panier = JSON.parse(savedPanier);
        updatePanier();
    }
}

// fonction pour ajouter un produit au panier
var addToPanier = function (index, quantity) {
    var product = catalog[index]; // Récupération du produit à partir de l'index
    var existingProduct = panier.find(item => item.index === index); // Recherche du produit dans le panier

    // Si le produit existe déjà dans le panier, on incrémente la quantité , sinon on l'ajoute
    if (existingProduct) {
        existingProduct.quantity += quantity;
        if (existingProduct.quantity > MAX_QTY) {
            existingProduct.quantity = MAX_QTY; // On limite la quantité à MAX_QTY
        }
    } else {
        panier.push({ index: index, quantity: quantity }); 
    }

    updatePanier();
}

// fonction pour mettre à jour le panier
var updatePanier = function () {
    // Récupération de l'élément #panier
    var panierElement = document.querySelector("#panier .achats");
    panierElement.innerHTML = ""; // On vide le panier

    var total = 0;
    
    // Pour chaque produit dans le panier, on crée un élément .achat et on l'ajoute à l'élément #panier 
    panier.forEach(item => {
        var product = catalog[item.index];
        var panierItem = document.createElement("div");
        panierItem.className = "achat";
        panierItem.id = item.index + "-achat";

        var figure = createFigureBlock(product);
        panierItem.appendChild(figure);

        var name = createBlock("h4", product.name);
        panierItem.appendChild(name);

        // Ajout d'un champ de saisie pour la quantité
        var quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.step = "1";
        quantityInput.value = item.quantity;
        quantityInput.min = "0";
        quantityInput.max = MAX_QTY.toString();
        quantityInput.className = "quantite";
        // Ajout d'un gestionnaire d'événements pour mettre à jour la quantité
        quantityInput.addEventListener("input", function() {
            var value = parseInt(quantityInput.value, 10);
            if (isNaN(value) || value < 0 || value > MAX_QTY) {
                quantityInput.value = item.quantity;
            } else {
                item.quantity = value;
                updatePanier();
            }
        });
        panierItem.appendChild(quantityInput);

        var price = createBlock("div", product.price, "prix");
        panierItem.appendChild(price);

        var control = document.createElement("div");
        control.className = "controle";
        // Ajout d'un bouton pour retirer le produit du panier
        var removeButton = document.createElement("button");
        removeButton.className = "retirer";
        removeButton.id = item.index + "-remove";
        removeButton.addEventListener("click", (function(index) {
            return function() {
                removeFromPanier(index);
            };
        })(item.index));
        control.appendChild(removeButton);

        panierItem.appendChild(control);

        panierElement.appendChild(panierItem);

        total += product.price * item.quantity;
    });

    document.getElementById("montant").innerText = total; // Mise à jour du montant total

    // Sauvegarder le panier dans localStorage
    localStorage.setItem("panier", JSON.stringify(panier));
}

// fonction pour retirer un produit du panier
var removeFromPanier = function (index) {
    panier = panier.filter(item => item.index !== index);
    updatePanier();
}

/*
* create and add all the div.produit elements to the div#boutique element
* according to the product objects that exist in 'catalog' variable
*/
var createShop = function () {
    var shop = document.getElementById("boutique");
    for(var i = 0; i < catalog.length; i++) {
        shop.appendChild(createProduct(catalog[i], i));
    }
}

/*
* create the div.produit elment corresponding to the given product
* The created element receives the id "index-product" where index is replaced by param's value
* @param product (product object) = the product for which the element is created
* @param index (int) = the index of the product in catalog, used to set the id of the created element
*/
var createProduct = function (product, index) {
    // build the div element for product
    var block = document.createElement("div");
    block.className = "produit";
    // set the id for this product
    block.id = index + "-" + productIdKey;
    // build the h4 part of 'block'
    block.appendChild(createBlock("h4", product.name));
    
    // /!\ should add the figure of the product... does not work yet... /!\ 
    block.appendChild(createFigureBlock(product));

    // build and add the div.description part of 'block' 
    block.appendChild(createBlock("div", product.description, "description"));
    // build and add the div.price part of 'block'
    block.appendChild(createBlock("div", product.price, "prix"));
    // build and add control div block to product element
    block.appendChild(createOrderControlBlock(index));
    return block;
}

/* return a new element of tag 'tag' with content 'content' and class 'cssClass'
 * @param tag (string) = the type of the created element (example : "p")
 * @param content (string) = the html wontent of the created element (example : "bla bla")
 * @param cssClass (string) (optional) = the value of the 'class' attribute for the created element
 */
var createBlock = function (tag, content, cssClass) {
    var element = document.createElement(tag);
    if (cssClass != undefined) {
        element.className =  cssClass;
    }
    element.innerHTML = content;
    return element;
}

/*
* builds the control element (div.controle) for a product
* @param index = the index of the considered product
*
* TODO : add the event handling, 
*   /!\  in this version button and input do nothing  /!\  
*/
var createOrderControlBlock = function (index) {
    var control = document.createElement("div");
    control.className = "controle";

    // create input quantity element
    var input = document.createElement("input");
    input.id = index + '-' + inputIdKey;
    input.type = "number";
    input.step = "1";
    input.value = "0";
    input.min = "0";
    input.max = MAX_QTY.toString();
    // add input to control as its child
    control.appendChild(input);
    
    // create order button
    var button = document.createElement("button");
    button.className = 'commander';
    button.id = index + "-" + orderIdKey;
    // add control to control as its child
    //on rend le bouton non cliquable
    button.style.opacity = "0.5"; 
    button.disabled = true;     
    control.appendChild(button);
    
    // the built control div node is returned
    // on Ajoute un gestionnaire d'événements pour valider la quantité saisie
    input.addEventListener("input", function() {
        var value = parseInt(input.value, 10);
        if (isNaN(value) || value < 0 || value > MAX_QTY) {
            input.value = "0";
        }
        // Activation/désactivation du bouton de mise en panier
        if (input.value === "0") {
            button.style.opacity = "0.5";
            button.disabled = true;
        } else {
            button.style.opacity = "1";
            button.disabled = false;
        }
    });

    // on  Ajoute un gestionnaire d'événements pour ajouter l'article au panier
    button.addEventListener("click", function() {
        addToPanier(index, parseInt(input.value, 10));
        input.value = "0";
        button.style.opacity = "0.5";
        button.disabled = true;
    });

    return control;
}

/*
* create and return the figure block for this product
* see the static version of the project to know what the <figure> should be
* @param product (product object) = the product for which the figure block is created
*/
var createFigureBlock = function (product) {
    // creattion de l'élément figure
    var figure = document.createElement("figure");

    // Création de l'élément img
    var img = document.createElement("img");
    img.src = product.image; // Ajout de l'attribut src
    figure.appendChild(img); // Ajout de l'élément img à l'élément figure

    return figure;
}
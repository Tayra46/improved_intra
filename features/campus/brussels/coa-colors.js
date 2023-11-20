/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   coa-colors.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hle-roi <hle-roi@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/11/15 10:48:05 by hle-roi           #+#    #+#             */
/*   Updated: 2023/11/15 11:20:38 by hle-roi          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Sélectionne tous les éléments avec le style spécifié
var elements1 = document.querySelectorAll('[style="color: #BA0000 !important;"]');
var elements2 = document.querySelectorAll('[style="color: #005200 !important;"]');
var elements3 = document.querySelectorAll('[style="color: #0E23B2 !important;"]');

// Fonction pour remplacer le style
function remplacerStyle(elements) {
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.setProperty('color', '#ffffff', 'important');
    }
}

// Appelle la fonction pour chaque groupe d'éléments
remplacerStyle(elements1);
remplacerStyle(elements2);
remplacerStyle(elements3);

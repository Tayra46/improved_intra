/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   slots-link.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hle-roi <hle-roi@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/03/18 11:53:51 by hle-roi           #+#    #+#             */
/*   Updated: 2024/03/21 11:27:58 by hle-roi          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//get manage slots button
const element = document.querySelector('a[href="/slots"]');
const element2 = document.querySelector('a[href="/projects/pipex/slots?team_id=5579132"]')

//remplace le lien
if (element)
{
    element.href = "https://slots.s19.be/slots";
}

if (element2)
{
    element2.href = "https://slots.s19.be/slots";
}
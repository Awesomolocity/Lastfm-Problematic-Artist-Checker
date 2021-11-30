// ==UserScript==
// @name         LastFM Problematic Artist Checker
// @namespace    https://github.com/Awesomolocity/Lastfm-Problematic-Artist-Checker
// @downloadURL  https://github.com/Awesomolocity/Lastfm-Problematic-Artist-Checker/raw/master/index.user.js
// @version      1.1.0
// @description  Checks LastFM profiles for any problematic artists. It's worth remembering that a non-zero number doesn't necessarily mean the user in question is a nazi / nazi sympathizer. But it's still worth keeping an eye on it.
// @author       Awesomolocity
// @match        https://www.last.fm/user/*
// @exclude      https://www.last.fm/user/*/*
// @icon         https://www.google.com/s2/favicons?domain=last.fm
// ==/UserScript==

(function() {
	'use strict';
	
	function HTMLToDocument(htmlString){
		return new DOMParser().parseFromString(htmlString, 'text/html');
	}
	
	function getUsername(){
		return document.querySelector('.header-title').innerText;
	}
	
	function getArtistsFromPage(href, selector){
		const request = new Request(href);
		return fetch(request).then(response => {
			if(response.status === 200){
				return response.text();
			}
			else{
				throw new Error('Something went wrong getting the data from Last.FM! :c')
			}
		}).then(response => {
			const libraryPage = HTMLToDocument(response);
			return [... //Convert the set to an array
				new Set( //Sets are nice because they force uniqueness
					[...libraryPage.querySelectorAll(selector)].map(
						artist => artist.textContent.trim()
					)
				)
			];
		});
	}
	
	function getArtistsFromRecentScrobbles(){
		const username = getUsername();
		const libraryURL = 'https://www.last.fm/user/'+ username +'/library';
		
		return getArtistsFromPage(libraryURL, '.chartlist-artist');
	}
	function getArtistsFromTopArtists(){
		const username = getUsername();
		const artistsURL = 'https://www.last.fm/user/'+ username +'/library/artists';
		
		return getArtistsFromPage(artistsURL, '.link-block-target');
	}
	
	function getArtistsFromTopAlbums(){
		const username = getUsername();
		const albumsURL = 'https://www.last.fm/user/'+ username +'/library/albums';
		
		return getArtistsFromPage(albumsURL, '.chartlist-artist');
	}
	function getArtistsFromTopTracks(){
		const username = getUsername();
		const tracksURL = 'https://www.last.fm/user/'+ username +'/library/tracks';
		
		return getArtistsFromPage(tracksURL, '.chartlist-artist');
	}
	async function getArtists(){
		return [...
			new Set(
				[].concat(
					await getArtistsFromRecentScrobbles(),
					await getArtistsFromTopArtists(),
					await getArtistsFromTopAlbums(),
					await getArtistsFromTopTracks()
				)
			)
		];
	}
	
	const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS70_P5rBBdArG539fGuRO3zS_Wt2Pm71_FeMwjQGBG-8iqGq9apAGMJuahBuMnRN_KpzPVc6R_lKSq/pub?output=csv';
	const request = new Request(sheetURL);
	fetch(request).then(response => {
		if(response.status === 200){
			return response.text();
		}
		else{
			throw new Error('Something went wrong getting the data from Google! :c')
		}
	}).then(async response => {
		const artists = response.split('\r\n');
		artists.shift(); //First row is a header, so lets remove that
		const problematicArtists = await getArtists();
		
		const problematicArtistCount = problematicArtists.filter(artist => artists.includes(artist)).length;
		
		const span = document.createElement('span');
		span.innerText = ' • ' + problematicArtistCount + ' problematic artist' + (problematicArtistCount === 1 ? '' : 's');
		
		document.querySelector('.header-scrobble-since').after(span);
	});
})();

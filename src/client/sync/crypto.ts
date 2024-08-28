export async function hash(text_utf8) {
	let text_buffer = buffer_from_utf8(text_utf8);
	let hash_buffer = await window.crypto.subtle.digest("SHA-256", text_buffer);
	return [...new Uint8Array(hash_buffer)].map(byte => byte.toString(16).padStart(2, '0')).join("");
}

export function get_random_id() {
	let id_crypto = window.crypto.getRandomValues(new Uint32Array(1));
	return id_crypto[0].toString(32)
}



function base64_from_crypto(crypto) {
	return btoa(String.fromCharCode(...new Uint8Array(crypto)));
}

function crypto_from_base64(base64) {
	return new Uint8Array(Array.from(atob(base64)).map(c => c.charCodeAt(0)));
}

function utf8_from_buffer(buffer) {
	return new TextDecoder().decode(buffer);
}

function buffer_from_utf8(utf8) {
	return new TextEncoder().encode(utf8);
}



async function base64_key_from_password(password_buffer, salt_buffer) {
	let base_raw = await window.crypto.subtle.importKey('raw', password_buffer, 'PBKDF2', false, ["deriveKey"]);

	let key_raw = await window.crypto.subtle.deriveKey(
		{ name: "PBKDF2", salt: salt_buffer, iterations: 100000, hash: "SHA-256" },
		base_raw,
		{ name: "AES-GCM", length: 256 },
		true,
		["wrapKey"]
	);

	let key_crypto = await window.crypto.subtle.exportKey("raw", key_raw);

	return base64_from_crypto(key_crypto);
}

async function raw_key_from_base64(key_base64, usages) {
	let key_crypto = crypto_from_base64(key_base64);

	return await window.crypto.subtle.importKey('raw', key_crypto, 'AES-GCM', false, usages);
}

export async function create_key(password_utf8, salt_utf8) {
	let password_buffer = buffer_from_utf8(password_utf8);
	let salt_buffer = buffer_from_utf8(salt_utf8);

	return await base64_key_from_password(password_buffer, salt_buffer);
}



export async function encrypt(text_utf8, key_base64) {
	let iv_crypto = window.crypto.getRandomValues(new Uint8Array(16));
	let text_buffer = buffer_from_utf8(text_utf8);
	let key_raw = await raw_key_from_base64(key_base64, ["encrypt"]);

	let cipher_crypto = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv_crypto }, key_raw, text_buffer);

	return {
		cipher: base64_from_crypto(cipher_crypto),
		iv: base64_from_crypto(iv_crypto)
	}
}

export async function decrypt(cipher_base64, iv_base64, key_base64) {
	let iv_crypto = crypto_from_base64(iv_base64);
	let cipher_crypto = crypto_from_base64(cipher_base64);
	let key_raw = await raw_key_from_base64(key_base64, ["decrypt"]);

	let text_buffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv_crypto }, key_raw, cipher_crypto);

	return utf8_from_buffer(text_buffer);
}



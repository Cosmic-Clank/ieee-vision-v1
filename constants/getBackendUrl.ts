const getBackendUrl = async (): Promise<string> => {
	const response = await fetch("https://cosmic-clank.github.io/ieeebackendurl/");
	const text = await response.text();
	console.log("Backend URL:", text); // Log the full URL for debugging
	return text;
};

export default getBackendUrl;

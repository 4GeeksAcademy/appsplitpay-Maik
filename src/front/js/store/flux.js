const apiUrl = process.env.BACKEND_URL + "/api";

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			token: null,
			userInfo: null,
			isAuthenticated: false,
			errorMessage: null,
			loading: false,
			contacts: [],
			groups: [],
			events: [],
			groupDetails: null,
			userContact: null,
		},
		actions: {
			login: async (email, password) => {
				setStore({ loading: true });
				try {
					const response = await fetch(apiUrl + "/login", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, password })
					});

					if (response.ok) {
						const data = await response.json();
						// Asegúrate de que 'data.user' contiene la información del usuario
						if (data.token && data.user) {
							setStore({
								token: data.token,
								isAuthenticated: true,
								userInfo: data.user,  // Guardar la información del usuario en el store
								loading: false,
								errorMessage: null
							});

							// Guardar token e información del usuario en el localStorage
							localStorage.setItem("token", data.token);
							localStorage.setItem("userInfo", JSON.stringify(data.user));
							return true;
						} else {
							// Manejar el caso en que el token o la información del usuario no se devuelvan correctamente
							setStore({
								errorMessage: "Login successful but user data is missing.",
								loading: false,
								isAuthenticated: false,
							});
							return false;
						}
					} else {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.msg || "Login failed",
							loading: false,
							isAuthenticated: false,
						});
						return false;
					}
				} catch (error) {
					console.error("There was an error logging in:", error);
					setStore({
						errorMessage: "An error occurred during login.",
						loading: false,
						isAuthenticated: false,
					});
					return false;
				}
			},

			signup: async (username, email, password, first_name, last_name, age, address, paypal_username) => {
				setStore({ loading: true });
				console.log(username)
				try {
					const response = await fetch(apiUrl + "/signup", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username, email, password, first_name, last_name, age, address, paypal_username })
					});
					console.log(response)
					if (response.ok) {
						const data = await response.json();
						setStore({
							token: data.token,
							isAuthenticated: true,
							loading: false,
							errorMessage: null
						});

						if (data.token) {
							localStorage.setItem("token", data.token);
						}

						return true;
					} else {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.msg || "Signup failed",
							loading: false
						});
						return false;
					}
				} catch (error) {
					console.error("There was an error signing up:", error);
					setStore({
						errorMessage: "An error occurred during signup.",
						loading: false
					});
					return false;
				}
			},

			logout: async () => {
				try {
					setStore({
						token: null,
						userInfo: null,
						isAuthenticated: false,
						errorMessage: null,
					});

					localStorage.removeItem("token");
					localStorage.removeItem("userInfo");

					return true;
				} catch (error) {
					console.error("There was an error logging out:", error);
					setStore({
						errorMessage: "An error occurred during logout."
					});
					return false;
				}
			},

			checkAuthentication: () => {
				const token = localStorage.getItem("token");
				const userInfo = localStorage.getItem("userInfo");

				if (token && userInfo) {
					setStore({
						token: token,
						userInfo: JSON.parse(userInfo),  // Carga la información del usuario desde el localStorage
						isAuthenticated: true,
					});
				} else {
					setStore({
						isAuthenticated: false,
					});
				}
			},

			updateUserInfo: (newUserInfo) => {
				const store = getStore();
				setStore({
					userInfo: { ...store.userInfo, ...newUserInfo }
				});
			},

			getMessage: () => {
				const store = getStore();
				return store.message;
			},

			setMessage: (msg) => {
				setStore({ message: msg });
			},


			createGroup: async (name, members_id) => {
				const { token } = getStore()
				try {
					const response = await fetch(apiUrl + "/group", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": "Bearer " + token
						},
						body: JSON.stringify({ name, members_id })
					});
					if (response.ok) {
						const data = await response.json();
						alert("group succesfully created ")

						setStore({
							groups: [...getStore().groups, data.group]
						});
					} else {
						const errorData = await response.json();
						alert(`Error: ${errorData.error}`);
					}
				} catch (error) {
					console.error("Error in createGroup:", error)
					alert("there was an error creating group")
				}
			},

			getContacts: async () => {
				const { token } = getStore();
				setStore({ loading: true });
				try {
					const response = await fetch(apiUrl + "/contact", {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					});
					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to fetch contacts",
							loading: false,
						});
						return [];
					}
					const data = await response.json();
					setStore({
						contacts: data.contacts,
						loading: false,
						errorMessage: null,
					});
					return data.contacts;
				} catch (error) {
					console.error("Error fetching contacts:", error);
					setStore({
						errorMessage: "An error occurred while fetching contacts.",
						loading: false,
					});
					return [];
				}
			},



			// Función para solicitar un enlace de recuperación de contraseña
			requestPasswordRecovery: async (email) => {
				try {
					// Realiza la solicitud POST al servidor
					const response = await fetch(apiUrl + "/requestpasswordrecovery", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email })
					});
					if (response.ok) {
						const data = await response.json();
						// Verifica si el servidor ha enviado un token en la respuesta
						if (data.token) {
							console.log("Token recibido:", data.token);
							return {
								msg: "Correo enviado con las instrucciones para cambiar la contraseña.",
								token: data.token
							};
						} else {
							// Si no hay token, solo devolvemos el mensaje
							return {
								msg: "Correo enviado con las instrucciones para cambiar la contraseña."
							};
						}
					} else {
						// Maneja el caso en que la respuesta del servidor no es exitosa
						const errorData = await response.json();
						throw new Error(errorData.msg || "Error al solicitar la recuperación de contraseña.");
					}
				} catch (error) {
					// Maneja cualquier error que pueda ocurrir durante la solicitud
					console.error("Error:", error);
					throw error;
				}
			},
			getSingleUser: async (username) => {
				const store = getStore();
				try {
					const response = await fetch(`${apiUrl}/search?username=${encodeURIComponent(username)}`, {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${store.token}`,
							'Content-Type': 'application/json'
						}
					});
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || 'Error al obtener el usuario');
					}
					const data = await response.json();
					setStore({ userContact: data.user });
					return data;
				} catch (error) {
					console.error("Error fetching single usuario:", error);
					setStore({ errorMessage: error.message || "Error al obtener el usuario" });
				}
			},
			getContacts: async () => {
				const { token } = getStore();
				setStore({ loading: true });
				try {
					const response = await fetch(apiUrl + "/contact", {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					});
					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to fetch contacts",
							loading: false,
						});
						return [];
					}
					const data = await response.json();
					setStore({
						contacts: data.contacts,
						loading: false,
						errorMessage: null,
					});
					return data.contacts;
				} catch (error) {
					console.error("Error fetching contacts:", error);
					setStore({
						errorMessage: "An error occurred while fetching contacts.",
						loading: false,
					});
					return [];
				}
			},
			addContact: async (username, fullname, paypal_username, email) => {
				const { token } = getStore();
				setStore({ loading: true });
				try {
					const response = await fetch(apiUrl + "/contact", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`,
						},
						body: JSON.stringify(username, fullname, paypal_username, email),
					});
					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to add contact",
							loading: false,
						});
						return null;
					}
					const data = await response.json();
					setStore({
						loading: false,
						errorMessage: null,
					});
					return data.contact;
				} catch (error) {
					console.error("Error adding contact:", error);
					setStore({
						errorMessage: "An error occurred while adding contact.",
						loading: false,
					});
					return null;
				}
			},



			getPayments: async () => {
				try {
					const response = await fetch(`${apiUrl}/payments`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${getStore().token}`,
						},
					});
					return response.json();
				} catch (error) {
					console.error(error);
					return [];
				}
			},

			getPayment: async (paymentId) => {
				try {
					const response = await fetch(`${apiUrl}/payments/${paymentId}`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${getStore().token}`,
						},
					});
					return response.json();
				} catch (error) {
					console.error(error);
					return null;
				}
			},

			createPayment: async (data) => {
				setStore({ loading: true });
				try {
					const response = await fetch(`${apiUrl}/payments/`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${getStore().token}`,
						},
						body: JSON.stringify(data),
					});
					if (response.ok) {
						const data = await response.json();
						setStore({
							loading: false,
							errorMessage: null,
						});
						return true;
					} else {
						const errorData = await response.json();
						if (errorData.error === "Contact not found") {
							setStore({
								errorMessage: "El contacto no existe",
								loading: false,
							});
						} else {
							setStore({
								errorMessage: errorData.error || "Error creating payment",
								loading: false,
							});
						}
						return false;
					}
				} catch (error) {
					console.error("Error creating payment:", error);
					setStore({
						errorMessage: "An error occurred while creating payment.",
						loading: false,
					});
					return false;
				}
			},

			// ----------------------------------------------------------------------------

			getUserGroups: async () => {
				const { token } = getStore();
				setStore({ loading: true });
				try {
					const response = await fetch(`${apiUrl}/groups`, {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					});
					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to fetch user groups",
							loading: false,
						});
						return [];
					}
					const data = await response.json();
					setStore({
						groups: data.groups,
						loading: false,
						errorMessage: null,
					});
					return data.groups;
				} catch (error) {
					console.error("Error fetching user groups:", error);
					setStore({
						errorMessage: "An error occurred while fetching user groups.",
						loading: false,
					});
					return [];
				}
			},

			getAllEvents: async (groupId) => {
				const store = getStore();
				try {
					const resp = await fetch(`${apiUrl}/group/${groupId}/events`, {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${store.token}`
						}
					});
					if (resp.ok) {
						const data = await resp.json();
						setStore({ events: data });
						return data;
					} else {
						const error = await resp.json();
						setStore({ errorMessage: error.error });
						return null;
					}
				} catch (error) {
					console.error("Error getting all events:", error);
					setStore({ errorMessage: "An unexpected error occurred" });
					return null;
				}
			},








		},
	};
};

export default getState;

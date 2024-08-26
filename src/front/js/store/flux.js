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
			groupDetails: null,
		},
		actions: {
			login: async (username, password) => {
				setStore({ loading: true });
				try {
					const response = await fetch(apiUrl + "/login", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username, password })
					});

					if (response.ok) {
						const data = await response.json();
						setStore({
							token: data.token,
							isAuthenticated: true,
							loading: false,
							errorMessage: null
						});

						localStorage.setItem("token", data.token);
						return true;
					} else {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.msg || "Login failed",
							loading: false
						});
						return false;
					}
				} catch (error) {
					console.error("There was an error logging in:", error);
					setStore({
						errorMessage: "An error occurred during login.",
						loading: false
					});
					return false;
				}
			},

			signup: async (username, email, password, first_name, last_name, age, address) => {
				setStore({ loading: true });
				try {
					const response = await fetch(apiUrl + "/signup", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username, email, password, first_name, last_name, age, address })
					});

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

			// Agregar un CONTACTO
			addContact: async (contactData) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/contact`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`,
						},
						body: JSON.stringify(contactData),
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

			// Obtener contactos
			getContacts: async (searchQuery = "") => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/contact?search=${searchQuery}`, {
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
						contacts: data.contacts || [],
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




			getSingleContact: async (contactId) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/contact/${contactId}`, {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${token}`,
						},
					});

					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to fetch contact",
							loading: false,
						});
						return null;
					}

					const data = await response.json();
					setStore({ loading: false, errorMessage: null });

					return data.contact;
				} catch (error) {
					console.error("Error fetching contact:", error);
					setStore({
						errorMessage: "An error occurred while fetching contact.",
						loading: false,
					});
					return null;
				}
			},


			// Editar un contacto
			editContact: async (contactId, updatedContactData) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/contact/${contactId}`, {
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`,
						},
						body: JSON.stringify(updatedContactData),
					});

					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to edit contact",
							loading: false,
						});
						return null;
					}

					const data = await response.json();
					setStore({ loading: false, errorMessage: null });

					return data; // Retorna el contacto actualizado
				} catch (error) {
					console.error("Error editing contact:", error);
					setStore({
						errorMessage: "An error occurred while editing contact.",
						loading: false,
					});
					return null;
				}
			},

			// Eliminar un CONTACTO
			deleteContact: async (contactId) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/contact/${contactId}`, {
						method: "DELETE",
						headers: {
							"Authorization": `Bearer ${token}`,
						},
					});

					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to delete contact",
							loading: false,
						});
						return false;
					}

					setStore({ loading: false, errorMessage: null });
					return true; // Confirma que el contacto fue eliminado
				} catch (error) {
					console.error("Error deleting contact:", error);
					setStore({
						errorMessage: "An error occurred while deleting contact.",
						loading: false,
					});
					return false;
				}
			},

			checkAuthentication: () => {
				const token = localStorage.getItem("token");
				if (token) {
					setStore({
						token: token,
						isAuthenticated: true,
					});
				} else {
					setStore({
						isAuthenticated: false,
					});
				}
			},

			//-----------------------------------------------------------------#--------------------------CREATE_GROUP--------------------------------------------------------------------


			// Crear un grupo
			createGroup: async (groupData) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/group`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`,
						},
						body: JSON.stringify(groupData),
					});

					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to create group",
							loading: false,
						});
						return null;
					}

					const data = await response.json();
					setStore({
						loading: false,
						errorMessage: null,
					});

					return data.group; // Retorna el grupo creado
				} catch (error) {
					console.error("Error creating group:", error);
					setStore({
						errorMessage: "An error occurred while creating group.",
						loading: false,
					});
					return null;
				}
			},

			// Obtener detalles de un grupo por ID
			getGroupDetails: async (groupId) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/group/${groupId}`, {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${token}`,
						},
					});

					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to fetch group details",
							loading: false,
						});
						return null;
					}

					const data = await response.json();
					setStore({
						groupDetails: data,
						loading: false,
						errorMessage: null,
					});

					return data;
				} catch (error) {
					console.error("Error fetching group details:", error);
					setStore({
						errorMessage: "An error occurred while fetching group details.",
						loading: false,
					});
					return null;
				}
			},

			// Obtener todos los grupos del usuario
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
						groups: data.groups || [],
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

			// Eliminar un grupo
			deleteGroup: async (groupId) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/group/${groupId}`, {
						method: "DELETE",
						headers: {
							"Authorization": `Bearer ${token}`,
						},
					});

					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to delete group",
							loading: false,
						});
						return false;
					}

					setStore({ loading: false, errorMessage: null });
					return true; // Confirma que el grupo fue eliminado
				} catch (error) {
					console.error("Error deleting group:", error);
					setStore({
						errorMessage: "An error occurred while deleting group.",
						loading: false,
					});
					return false;
				}
			},

			// Agregar un miembro a un grupo
			addGroupMember: async (groupId, memberId) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/group/${groupId}/members`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`,
						},
						body: JSON.stringify({ member_id: memberId }),
					});

					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to add group member",
							loading: false,
						});
						return false;
					}

					setStore({ loading: false, errorMessage: null });
					return true; // Confirma que el miembro fue agregado
				} catch (error) {
					console.error("Error adding group member:", error);
					setStore({
						errorMessage: "An error occurred while adding group member.",
						loading: false,
					});
					return false;
				}
			},

			// Eliminar un miembro de un grupo
			deleteGroupMember: async (groupId, memberId) => {
				const { token } = getStore();
				setStore({ loading: true });

				try {
					const response = await fetch(`${apiUrl}/group/${groupId}/members`, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`,
						},
						body: JSON.stringify({ member_id: memberId }),
					});

					if (!response.ok) {
						const errorData = await response.json();
						setStore({
							errorMessage: errorData.error || "Failed to remove group member",
							loading: false,
						});
						return false;
					}

					setStore({ loading: false, errorMessage: null });
					return true; // Confirma que el miembro fue eliminado
				} catch (error) {
					console.error("Error removing group member:", error);
					setStore({
						errorMessage: "An error occurred while removing group member.",
						loading: false,
					});
					return false;
				}
			},


			//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
			}
		}
	};
};

export default getState;

import { clear, log } from "./module.js";

(() => {
	clear();

	// Employee class
	class Employee {
		constructor(name, age) {
			this.name = name;
			this.age = age;
		}
	}

	// Part-time class
	class PartTime extends Employee {
		constructor(name, age, hours, payRate) {
			super(name, age);
			this.hours = hours;
			this.payRate = this.roundToTwo(payRate);
			this.salary = this.calculatePay();
			this.type = "Part-time";
		}
		calculatePay() {
			return this.roundToTwo(this.payRate * this.hours * 52);
		}
		roundToTwo(num) {
			return parseFloat(num.toFixed(2));
		}
	}

	// Manager class
	class Manager extends Employee {
		constructor(name, age, hours, payRate) {
			super(name, age);
			this.hours = hours;
			this.payRate = this.roundToTwo(payRate);
			this.salary = this.calculatePay();
			this.type = "Manager";
		}
		calculatePay() {
			return this.roundToTwo(this.payRate * this.hours * 52 - 1000);
		}
		roundToTwo(num) {
			return parseFloat(num.toFixed(2));
		}
	}

	// Convert plain object to appropriate Employee subclass
	const convertToTracker = (employee) => {
		if (employee.hours < 40) {
			return new PartTime(
				employee.name,
				employee.age,
				employee.hours,
				employee.payRate || employee.salary / (52 * employee.hours)
			);
		} else {
			return new Manager(
				employee.name,
				employee.age,
				employee.hours,
				employee.payRate || employee.salary / (52 * employee.hours - 1000)
			);
		}
	};

	// Function to load employees from localStorage or use hardcoded if not available
	const loadEmployees = () => {
		const storedEmployees = localStorage.getItem("employeeArray");
		if (storedEmployees) {
			employeeArray = JSON.parse(storedEmployees).map(convertToTracker);
		} else {
			employeeArray = hardcodedEmployees.map(convertToTracker);
			// Save hardcoded employees to localStorage initially
			saveEmployees();
		}
		renderEmployees();
	};

	// Hardcoded employees
	const hardcodedEmployees = [
		{ name: "John", age: 30, hours: 40, payRate: 25.0 },
		{ name: "Jane", age: 28, hours: 35, payRate: 30.0 },
		{ name: "Dave", age: 46, hours: 32, payRate: 22.75 }
	];
	let employeeArray = [];

	// Load employees on launch
	const initializeEmployees = () => {
		loadEmployees();
	};

	// Function to save employees to localStorage
	const saveEmployees = () => {
		localStorage.setItem("employeeArray", JSON.stringify(employeeArray));
		log("Saved employees to local storage:", employeeArray);
	};

	// Function to render employees in the table
	const renderEmployees = () => {
		const employeeTable = document.querySelector("#employeeTable tbody");
		employeeTable.innerHTML = "";

		employeeArray.forEach((employee, index) => {
			const row = document.createElement("tr");

			row.innerHTML = `
                <td>${employee.name}</td>
                <td>${employee.age}</td>
                <td>${employee.type}</td>
                <td>${employee.payRate.toFixed(2)}</td>
                <td>${employee.hours}</td>
                <td>${employee.salary.toFixed(2)}</td>
                <td>
                    <button class="edit" data-index="${index}">Edit</button>
                    <button class="delete" data-index="${index}">Delete</button>
                </td>
            `;

			employeeTable.appendChild(row);
		});

		log("Rendered employees:", employeeArray);
	};

	// Function to show the add form and hide the edit form
	const showAddForm = () => {
		document.getElementById("employeeForm").style.display = "block";
		document.getElementById("editEmployeeForm").style.display = "none";
	};

	// Function to show the edit form and populate fields with employee data
	const showEditForm = (index) => {
		const employee = employeeArray[index];

		document.getElementById("employeeForm").style.display = "none";
		document.getElementById("editEmployeeForm").style.display = "block";

		document.getElementById("editIndex").value = index;
		document.getElementById("editName").value = employee.name;
		document.getElementById("editAge").value = employee.age;
		document.getElementById("editHours").value = employee.hours;
		document.getElementById("editPayRate").value = employee.payRate;

		// Populate labels next to inputs
		document.getElementById("editNameLabel").textContent = "Name";
		document.getElementById("editAgeLabel").textContent = "Age";
		document.getElementById("editHoursLabel").textContent = "Hours per week";
		document.getElementById("editPayRateLabel").textContent = "Pay Rate";
	};

	// Function to add event listeners
	const addEventListeners = () => {
		// Add employee form submit listener
		document
			.querySelector("#saveNewEmployee")
			.addEventListener("click", addEmployee);

		// Save edited employee listener
		document
			.querySelector("#saveEditedEmployee")
			.addEventListener("click", saveEditedEmployee);

		// Edit and delete buttons listener
		document
			.querySelector("#employeeTable")
			.addEventListener("click", (event) => {
				const target = event.target;
				if (target.classList.contains("delete")) {
					const index = target.dataset.index;
					deleteEmployee(index);
				} else if (target.classList.contains("edit")) {
					const index = target.dataset.index;
					showEditForm(index);
				}
			});

		// Cancel edit listener
		document
			.querySelector("#cancelEdit")
			.addEventListener("click", showAddForm);
	};

	// Function to add a new employee
	const addEmployee = () => {
		const name = document.querySelector("#name").value;
		const age = parseInt(document.querySelector("#age").value);
		const hours = parseInt(document.querySelector("#hours").value);
		const payRate = parseFloat(document.querySelector("#payRate").value);

		if (validateInput(name, age, hours, payRate)) {
			const newEmployee =
				hours >= 40
					? new Manager(name, age, hours, payRate)
					: new PartTime(name, age, hours, payRate);

			employeeArray.push(newEmployee);
			saveEmployees();
			renderEmployees();

			// Clear input fields after adding employee
			document.querySelector("#name").value = "";
			document.querySelector("#age").value = "";
			document.querySelector("#hours").value = "";
			document.querySelector("#payRate").value = "";

			showAddForm();
		} else {
			alert("Please fill in all fields with valid inputs.");
		}
	};

	// Function to validate input fields
	const validateInput = (name, age, hours, payRate) => {
		return name !== "" && !isNaN(age) && !isNaN(hours) && !isNaN(payRate);
	};

	// Function to save edited employee details
	const saveEditedEmployee = () => {
		const index = document.querySelector("#editIndex").value;
		const name = document.querySelector("#editName").value;
		const age = parseInt(document.querySelector("#editAge").value);
		const hours = parseInt(document.querySelector("#editHours").value);
		const payRate = parseFloat(document.querySelector("#editPayRate").value);

		if (validateInput(name, age, hours, payRate)) {
			let employee = employeeArray[index];

			if (hours >= 40 && !(employee instanceof Manager)) {
				// Change to Manager class
				employeeArray[index] = new Manager(name, age, hours, payRate);
			} else if (hours < 40 && !(employee instanceof PartTime)) {
				// Change to PartTime class
				employeeArray[index] = new PartTime(name, age, hours, payRate);
			} else {
				// Update existing employee
				employee.name = name;
				employee.age = age;
				employee.hours = hours;
				employee.payRate = employee.roundToTwo(payRate);
				employee.salary = employee.calculatePay();
			}

			saveEmployees();
			renderEmployees();
			showAddForm();
		} else {
			alert("Please fill in all fields with valid inputs.");
		}
	};

	// Function to delete an employee
	const deleteEmployee = (index) => {
		employeeArray.splice(index, 1);
		saveEmployees();
		renderEmployees();
	};

	// Initialize the application
	initializeEmployees();
	addEventListeners();
})();

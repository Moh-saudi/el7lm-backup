package main

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
)

type Student struct {
	ID        int
	Name      string
	Age       int
	Grade     string
	Address   string
	Phone     string
	Email     string
	ParentName string
}

func main() {
	// Open the CSV file
	file, err := os.Open("players.csv")
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		return
	}
	defer file.Close()

	// Create a new CSV reader
	reader := csv.NewReader(file)

	// Read the header row
	header, err := reader.Read()
	if err != nil {
		fmt.Printf("Error reading header: %v\n", err)
		return
	}

	// Print the header
	fmt.Println("CSV Headers:", header)

	// Read all records
	records, err := reader.ReadAll()
	if err != nil {
		fmt.Printf("Error reading records: %v\n", err)
		return
	}

	// Process each record
	var players []Student
	for _, record := range records {
		// Convert string values to appropriate types
		id, _ := strconv.Atoi(record[0])
		age, _ := strconv.Atoi(record[2])

		student := Student{
			ID:         id,
			Name:       record[1],
			Age:        age,
			Grade:      record[3],
			Address:    record[4],
			Phone:      record[5],
			Email:      record[6],
			ParentName: record[7],
		}
		players = append(players, student)
	}

	// Print the processed data
	fmt.Printf("\nProcessed %d player records:\n", len(players))
	for _, student := range players {
		fmt.Printf("\nStudent ID: %d\n", student.ID)
		fmt.Printf("Name: %s\n", student.Name)
		fmt.Printf("Age: %d\n", student.Age)
		fmt.Printf("Grade: %s\n", student.Grade)
		fmt.Printf("Address: %s\n", student.Address)
		fmt.Printf("Phone: %s\n", student.Phone)
		fmt.Printf("Email: %s\n", student.Email)
		fmt.Printf("Parent Name: %s\n", student.ParentName)
	}
} 
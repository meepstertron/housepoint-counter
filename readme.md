# House Points Management System

A web-based rewards system that manages student achievements through a house points system. Originally developed for ISSH (International School of Schaffhausen), this project is now available as an open-source solution for schools implementing house-based reward systems.

## Features

- Complete CRUD operations for student management
- Intuitive UI for awarding and tracking points
- House-based grouping system
- Google authentication integration (optional)
- Data archiving and backup capabilities
- Year-end data management

## Setup

1. Clone the repository
2. Configure environment variables
3. (Optional) Add Google API credentials for authentication
4. Run database migrations
5. Start the application

## Technical Details

The application supports:
- User authentication (local and Google OAuth)
- Academic year archiving
- Custom house configuration

## Usage

Teachers can:
- Manage student records
- Award/deduct points
- Archive historical data
- Manage house assignments

Admins can:
- Manage teachers
- See and inspect logs
- Purge data from database

## Technologies Used

- Frontend: React TS
- Backend: Python with flask (yes its monolithic, shame me)
- Database: MariaDB
- UI Framework: Shadcn/UI

## Contact

For questions or support, please contact:
- Email: jan.koch@hexagonical.ch

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

MIT License
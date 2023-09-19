CREATE TABLE users( 
	Id UNIQUEIDENTIFIER PRIMARY KEY,
	FirstName NVARCHAR(50) NOT NULL,
	LastName NVARCHAR(50) NOT NULL,
	PasswordHash NVARCHAR(255) NOT NULL,
	Email NVARCHAR(100) NOT NULL,
	Registered DATETIME NOT NULL,
	ProfilePic NVARCHAR(100)
);

CREATE TABLE roles(
	Id INT PRIMARY KEY IDENTITY,
	Name VARCHAR(50) NOT NULL,
	IsAdmin BIT NOT NULL
);

CREATE TABLE projects(
	Id UNIQUEIDENTIFIER PRIMARY KEY,
	Title VARCHAR(50) NOT NULL,
	Description TEXT,
	Created DATETIME NOT NULL,
	Updated DATETIME NOT NULL,
	IconName VARCHAR(50)
);

CREATE TABLE participants(
	Id INT PRIMARY KEY IDENTITY,
	UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES users(Id) ON DELETE CASCADE,
	ProjectId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES projects(Id) ON DELETE CASCADE,
	RoleId INT NOT NULL FOREIGN KEY REFERENCES roles(Id) ON DELETE CASCADE
);


CREATE TABLE projectLists(
	Id UNIQUEIDENTIFIER PRIMARY KEY,
	Title VARCHAR(50) NOT NULL,
	Position INT NOT NULL,
	Color VARCHAR(50),
	ProjectId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES projects(Id)
);

CREATE TABLE priorities(
	Id INT PRIMARY KEY IDENTITY,
	Name VARCHAR(50) NOT NULL,
	Lvl INT UNIQUE NOT NULL,
	Color VARCHAR(50),
	IconName VARCHAR(50)
);

CREATE TABLE issues(
	Id UNIQUEIDENTIFIER PRIMARY KEY,
	Title VARCHAR(50) NOT NULL,
	Description TEXT,
	Created DATETIME NOT NULL,
	Updated DATETIME NOT NULL,
	DueDate DATETIME,
	Position INT NOT NULL,
	TimeEstimate INT,
	TimeSpent INT,
	ProjectId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES projects(Id),
	ProjectListId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES projectLists(Id),
	UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES users(Id),
	PriorityId INT FOREIGN KEY REFERENCES priorities(Id)
);


CREATE TABLE assignedPeople(
	Id INT IDENTITY PRIMARY KEY,
	IssueId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES issues(Id) ON DELETE CASCADE,
	UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES users(Id) ON DELETE CASCADE
);	

CREATE TABLE comments(
	Id UNIQUEIDENTIFIER PRIMARY KEY,
	Content TEXT NOT NULL,
	Created DATETIME NOT NULL,
	Updated DATETIME NOT NULL,
	UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES users(Id),
	IssueId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES issues(Id)
);

insert into roles (Name, IsAdmin) VALUES
('Owner', 1), ('Member',0)

insert into priorities (Name, Lvl)
Values
('Lowest', 1), ('Low', 2), ('Medium', 3), ('High', 4), ('Highest', 5)

update priorities SET Color='blue' from priorities where Id='1'
update priorities SET Color='green' from priorities where Id='2'
update priorities SET Color='orange' from priorities where Id='3'
update priorities SET Color='red' from priorities where Id='4'
update priorities SET Color='black' from priorities where Id='5'

update priorities SET IconName='FcLowPriority' from priorities where Id='1'
update priorities SET IconName='FcLowPriority' from priorities where Id='2'
update priorities SET IconName='FcMediumPriority' from priorities where Id='3'
update priorities SET IconName='FcHighPriority' from priorities where Id='4'
update priorities SET IconName='FcHighPriority' from priorities where Id='5'

delete from priorities
select * from roles
select * from participants
select * from projects
select * from users
select * from priorities
select * from projectLists
select * from issues

delete from projects
delete from participants
/*
drop table assignedPeople
drop table comments
drop table issues
drop table lists
drop table participants
drop table priorities
drop table projects
drop table projectLists
drop table users
drop table project_lists
drop table roles
*/
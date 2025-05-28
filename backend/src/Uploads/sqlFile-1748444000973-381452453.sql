-- Create Voters Table (renamed from users)
CREATE TABLE voters (
    voter_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- Create Candidates Table
CREATE TABLE candidates (
    candidate_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    party VARCHAR(100)
);

-- Create Votes Table
CREATE TABLE votes (
    vote_id INT PRIMARY KEY AUTO_INCREMENT,
    voter_id INT NOT NULL,
    candidate_id INT NOT NULL,
    vote_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voter FOREIGN KEY (voter_id) REFERENCES voters(voter_id),
    CONSTRAINT fk_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
    CONSTRAINT unique_vote UNIQUE(voter_id)
);

-- Insert Sample Voters
INSERT INTO voters (username, email) VALUES
('alice', 'alice@example.com'),
('bob', 'bob@example.com');

-- Insert Sample Candidates
INSERT INTO candidates (name, party) VALUES
('John Doe', 'Party A'),
('Jane Smith', 'Party B');

-- Insert a Sample Vote
INSERT INTO votes (voter_id, candidate_id) VALUES
(1, 2);  -- Alice votes for Jane Smith

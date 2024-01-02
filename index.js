const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const dbConfig = require('./dbconfig');
const jwt = require('jsonwebtoken'); 
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000; 
const jwtSecret = '123456789';

app.use(bodyParser.json({limit: '50mb'}));

const checkDatabaseConnection = () => {
    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            console.log('Database connection failed');
        } else {
            console.log('Database connection successful');
        }
    });
};

checkDatabaseConnection();


// API endpoint for user signup
app.post('/addmember', (req, res) => {
    const {
        membername,
        password,
        email,
        role,
        permission,
        profilepicture,
        roledescription,
    } = req.body;

    if (!membername || !password || !email || !role || !permission || !profilepicture || !roledescription) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('membername', sql.NVarChar, membername);
        request.input('password', sql.NVarChar, password);
        request.input('email', sql.NVarChar, email);
        request.input('role', sql.NVarChar, role);
        request.input('permission', sql.NVarChar, permission);
        request.input('profilepicture', sql.NVarChar, profilepicture);
        request.input('roledescription', sql.NVarChar, roledescription);

        request.query(
            'INSERT INTO Addmember (MemberName, Password, Email, Role, Permission, ProfilePicture, RoleDescription) VALUES (@membername, @password, @email, @role, @permission, @profilepicture, @roledescription)',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(201).json({ message: 'Member registered successfully' });
            }
        );
    });
});

app.get('/getmembers', (req, res) => {
    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        request.query(
            'SELECT * FROM Addmember',
            (err, result) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                // Check if there are members in the result
                if (result.recordset.length === 0) {
                    return res.status(404).json({ error: 'No members found' });
                }

                // Return the list of members
                return res.status(200).json({ members: result.recordset });
            }
        );
    });
});

app.delete('/deletemember/:memberId', (req, res) => {
    const memberId = req.params.memberId;

    if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('memberId', sql.NVarChar, memberId);

        request.query(
            'DELETE FROM Addmember WHERE MemberID = @memberId',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(200).json({ message: 'Member deleted successfully' });
            }
        );
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();
        request.input('email', sql.NVarChar, email);
        request.input('password', sql.NVarChar, password);

        
        request.query(
            'SELECT * FROM Addmember WHERE email = @email AND password = @password',
            (err, result) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                if (result.recordset.length === 1) {
                    // User is authenticated. Generate a JWT token.
                    const user = result.recordset[0];
                    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret);

                    const userDetails = {
                        userId: user.id,
                        email: user.email,
                        membername: user.membername,
                        role: user.role,
                        permission: user.permission,
                        profilepicture: user.profilepicture,
                        roledescription: user.roledescription,
                        // Add other fields as needed
                    };

                    // Return the token and user details in the response.
                    return res.json({ token, user: userDetails });
                } else {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
            }
        );
    });
});

app.post('/addinvestor', (req, res) => {
    const {
        investorname,
        address,
        email,
        investorcategory,
        mobilenumber,
        officeaddress,
        documenttype,
        notes,
        DocumentNumber,
        IssuingAuthority,
        ExpiryDate,
        NTN,
        cnicpicture,    // Assuming this is a file path or URL, not binary data
        ProfilePicture, // Assuming this is a file path or URL, not binary data
    } = req.body;

    if (
        !investorname ||
        !address ||
        !email ||
        !investorcategory ||
        !mobilenumber ||
        !officeaddress ||
        !documenttype ||
        !notes ||
        !DocumentNumber ||
        !IssuingAuthority ||
        !ExpiryDate ||
        !NTN ||
        !cnicpicture ||
        !ProfilePicture
    ) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();
        

        // Use parameterized queries to prevent SQL injection
        request.input('investorname', sql.NVarChar(255), investorname);
        request.input('address', sql.NVarChar(255), address);
        request.input('email', sql.NVarChar(255), email);
        request.input('investorcategory', sql.NVarChar(255), investorcategory);
        request.input('mobilenumber', sql.NVarChar(255), mobilenumber);
        request.input('officeaddress', sql.NVarChar(255), officeaddress);
        request.input('documenttype', sql.NVarChar(255), documenttype);
        request.input('notes', sql.NVarChar(255), notes);
        request.input('DocumentNumber', sql.NVarChar(255), DocumentNumber);
        request.input('IssuingAuthority', sql.NVarChar(255), IssuingAuthority);
        request.input('ExpiryDate', sql.Date, ExpiryDate);
        request.input('NTN', sql.VarChar(20), NTN);
        request.input('cnicpicture', sql.NVarChar(sql.MAX), cnicpicture);
        request.input('ProfilePicture', sql.NVarChar(sql.MAX), ProfilePicture);

        request.query(
            'INSERT INTO AddInvestor (investorname, address, email, investorcategory, mobilenumber, officeaddress, documenttype, notes, DocumentNumber, IssuingAuthority, ExpiryDate, NTN, cnicpicture, ProfilePicture) VALUES (@investorname, @address, @email, @investorcategory, @mobilenumber, @officeaddress, @documenttype, @notes, @DocumentNumber, @IssuingAuthority, @ExpiryDate, @NTN, @cnicpicture, @ProfilePicture)',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(201).json({ message: 'Investor registered successfully' });
            }
        );
    });
});

app.get('/getinvestors', (req, res) => {
    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        request.query('SELECT * FROM AddInvestor', (err, result) => {
            sql.close();

            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database query error' });
            }

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'No investors found' });
            }

            const investorsData = result.recordset;
            return res.status(200).json({ investors: investorsData });
        });
    });
});

app.post('/addinvestment', (req, res) => {
    const {
        propertyname,
        investmentamount,
        investmentdate,
        investmenttype,
        investmentpercentage,
        notes,
        supportingdocument,
    } = req.body;

    if (!propertyname || !investmentamount || !investmentdate || !investmenttype || !investmentpercentage || !notes || !supportingdocument) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('propertyname', sql.NVarChar, propertyname);
        request.input('investmentamount', sql.Decimal, investmentamount);
        request.input('investmentdate', sql.Date, investmentdate);
        request.input('investmenttype', sql.NVarChar, investmenttype);
        request.input('investmentpercentage', sql.Decimal, investmentpercentage);
        request.input('notes', sql.NVarChar, notes);
        request.input('supportingdocument', sql.NVarChar, supportingdocument);

        request.query(
            'INSERT INTO AddInvestment (propertyname, investmentamount, investmentdate, investmenttype, investmentpercentage, notes, supportingdocument) VALUES (@propertyname, @investmentamount, @investmentdate, @investmenttype, @investmentpercentage, @notes, @supportingdocument)',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(201).json({ message: 'Investment added successfully' });
            }
        );
    });
});


 // Update Api for addinvestment
 
app.put('/updateinvestment/:id', (req, res) => {
    const investmentId = req.params.id;

    const {
        propertyname,
        investmentamount,
        investmentdate,
        investmenttype,
        investmentpercentage,
        notes,
        supportingdocument,
    } = req.body;

    if (!propertyname || !investmentamount || !investmentdate || !investmenttype || !investmentpercentage || !notes || !supportingdocument) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('investmentId', sql.Int, investmentId);
        request.input('propertyname', sql.NVarChar, propertyname);
        request.input('investmentamount', sql.Decimal, investmentamount);
        request.input('investmentdate', sql.Date, investmentdate);
        request.input('investmenttype', sql.NVarChar, investmenttype);
        request.input('investmentpercentage', sql.Decimal, investmentpercentage);
        request.input('notes', sql.NVarChar, notes);
        request.input('supportingdocument', sql.NVarChar, supportingdocument);

        request.query(
            'UPDATE AddInvestment SET propertyname = @propertyname, investmentamount = @investmentamount, investmentdate = @investmentdate, investmenttype = @investmenttype, investmentpercentage = @investmentpercentage, notes = @notes, supportingdocument = @supportingdocument WHERE id = @investmentId',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(200).json({ message: 'Investment updated successfully' });
            }
        );
    });
});


app.post('/addtransaction', (req, res) => {
    const {
        propertyname,
        transactionamount,
        transactiondate,
        transactiontype,
        notes,
        supportingdocument,
    } = req.body;

    if (!propertyname || !transactionamount || !transactiondate || !transactiontype || !notes || !supportingdocument) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('propertyname', sql.NVarChar, propertyname);
        request.input('transactionamount', sql.Decimal, transactionamount);
        request.input('transactiondate', sql.Date, transactiondate);
        request.input('transactiontype', sql.NVarChar, transactiontype);
        request.input('notes', sql.NVarChar, notes);
        request.input('supportingdocument', sql.NVarChar, supportingdocument);

        request.query(
            'INSERT INTO AddTransaction (propertyname, transactionamount, transactiondate, transactiontype, notes, supportingdocument) VALUES (@propertyname, @transactionamount, @transactiondate, @transactiontype, @notes, @supportingdocument)',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(201).json({ message: 'Transaction added successfully' });
            }
        );
    });
});



app.post('/holdingproperty', (req, res) => {
    const {
        propertyname,
        propertysize,
        propertycategory,
        propertylocation,
        propertyvalue,
        holdingtype,
        landpictures,
        description,
        financialdocument,
        legaldocument,
    } = req.body;

    if (!propertyname || !propertysize || !propertycategory || !propertylocation || !propertyvalue || !holdingtype || !landpictures || !description || !financialdocument || !legaldocument) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('propertyname', sql.NVarChar, propertyname);
        request.input('propertysize', sql.NVarChar, propertysize);
        request.input('propertycategory', sql.NVarChar, propertycategory);
        request.input('propertylocation', sql.NVarChar, propertylocation);
        request.input('propertyvalue', sql.Decimal, propertyvalue);
        request.input('holdingtype', sql.NVarChar, holdingtype);
        request.input('landpictures', sql.NVarChar, landpictures);
        request.input('description', sql.NVarChar, description);
        request.input('financialdocument', sql.NVarChar, financialdocument);
        request.input('legaldocument', sql.NVarChar, legaldocument);

        request.query(
            'INSERT INTO Addholdingproperty (propertyname, propertysize, propertycategory, propertylocation, propertyvalue, holdingtype, landpictures, description, financialdocument, legaldocument) VALUES (@propertyname, @propertysize, @propertycategory, @propertylocation, @propertyvalue, @holdingtype, @landpictures, @description, @financialdocument, @legaldocument)',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(201).json({ message: 'Holding Property added successfully' });
            }
        );
    });
});



app.post('/rentalproperty', (req, res) => {
    const {
        propertyname,
        propertysize,
        typeofrentalproperty,
        location,
        leaseterms,
        status,
        rentalsqft,
        tenantcategory,
        landpictures,
        description,
        financialdocument,
        legaldocument,
    } = req.body;

    if (!propertyname || !propertysize || !typeofrentalproperty || !location || !leaseterms || !status || !rentalsqft || !tenantcategory || !landpictures || !description || !financialdocument || !legaldocument) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('propertyname', sql.NVarChar, propertyname);
        request.input('propertysize', sql.NVarChar, propertysize);
        request.input('typeofrentalproperty', sql.NVarChar, typeofrentalproperty);
        request.input('location', sql.NVarChar, location);
        request.input('leaseterms', sql.NVarChar, leaseterms);
        request.input('status', sql.NVarChar, status);
        request.input('rentalsqft', sql.Decimal, rentalsqft);
        request.input('tenantcategory', sql.NVarChar, tenantcategory);
        request.input('landpictures', sql.NVarChar, landpictures);
        request.input('description', sql.NVarChar, description);
        request.input('financialdocument', sql.NVarChar, financialdocument);
        request.input('legaldocument', sql.NVarChar, legaldocument);

        request.query(
            'INSERT INTO Addrentalproperty (propertyname, propertysize, typeofrentalproperty, location, leaseterms, status, rentalsqft, tenantcategory, landpictures, description, financialdocument, legaldocument) VALUES (@propertyname, @propertysize, @typeofrentalproperty, @location, @leaseterms, @status, @rentalsqft, @tenantcategory, @landpictures, @description, @financialdocument, @legaldocument)',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(201).json({ message: 'Rental Property added successfully' });
            }
        );
    });
});



app.post('/developmentproperty', (req, res) => {
    const {
        propertyname,
        landsize,
        typeofdevelopmentproperty,
        location,
        expecteddate,
        status,
        landpictures,
        description,
        financialdocument,
        legaldocument,
    } = req.body;

    if (!propertyname || !landsize || !typeofdevelopmentproperty || !location || !expecteddate || !status || !landpictures || !description || !financialdocument || !legaldocument) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('propertyname', sql.NVarChar, propertyname);
        request.input('landsize', sql.NVarChar, landsize);
        request.input('typeofdevelopmentproperty', sql.NVarChar, typeofdevelopmentproperty);
        request.input('location', sql.NVarChar, location);
        request.input('expecteddate', sql.NVarChar, expecteddate);
        request.input('status', sql.NVarChar, status);
        request.input('landpictures', sql.NVarChar, landpictures);
        request.input('description', sql.NVarChar, description);
        request.input('financialdocument', sql.NVarChar, financialdocument);
        request.input('legaldocument', sql.NVarChar, legaldocument);

        request.query(
            'INSERT INTO Adddevelopmentproperty (propertyname, landsize, typeofdevelopmentproperty, location, expecteddate, status, landpictures, description, financialdocument, legaldocument) VALUES (@propertyname, @landsize, @typeofdevelopmentproperty, @location, @expecteddate, @status, @landpictures, @description, @financialdocument, @legaldocument)',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(201).json({ message: 'Development Property added successfully' });
            }
        );
    });
});


app.post('/otherinvestment', (req, res) => {
    const {
        investmentinformation,
        investmentvalue,
        investmenttype,
        location,
        investmentterms,
        status,
        landpictures,
        description,
        financialdocument,
        legaldocument,
    } = req.body;

    if (!investmentinformation || !investmentvalue || !investmenttype || !location || !investmentterms || !status || !landpictures || !description || !financialdocument || !legaldocument) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('investmentinformation', sql.NVarChar, investmentinformation);
        request.input('investmentvalue', sql.NVarChar, investmentvalue);
        request.input('investmenttype', sql.NVarChar, investmenttype);
        request.input('location', sql.NVarChar, location);
        request.input('investmentterms', sql.NVarChar, investmentterms);
        request.input('status', sql.NVarChar, status);
        request.input('landpictures', sql.NVarChar, landpictures);
        request.input('description', sql.NVarChar, description);
        request.input('financialdocument', sql.NVarChar, financialdocument);
        request.input('legaldocument', sql.NVarChar, legaldocument);

        request.query(
            'INSERT INTO OtherInvestment (investmentinformation, investmentvalue, investmenttype, location, investmentterms, status, landpictures, description, financialdocument, legaldocument) VALUES (@investmentinformation, @investmentvalue, @investmenttype, @location, @investmentterms, @status, @landpictures, @description, @financialdocument, @legaldocument)',
            (err) => {
                sql.close();

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database query error' });
                }

                return res.status(201).json({ message: 'Other Investment added successfully' });
            }
        );
    });
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

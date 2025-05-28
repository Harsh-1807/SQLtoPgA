import re
import sys

def convert_sql_schema(sql_content):
    """
    Convert MySQL/other SQL syntax to PostgreSQL compatible syntax
    
    Args:
        sql_content: Original SQL content
        
    Returns:
        Converted SQL content
    """
    # First, handle CREATE TABLE statements
    def convert_create_table(match):
        table_def = match.group(0)
        
        # Convert AUTO_INCREMENT to SERIAL
        table_def = re.sub(
            r'(\w+)\s+INT(?:EGER)?\s+AUTO_INCREMENT',
            r'\1 SERIAL',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Handle AUTO_INCREMENT as a column attribute
        table_def = re.sub(
            r'AUTO_INCREMENT',
            '',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Convert UNSIGNED to CHECK constraint
        def replace_unsigned(match):
            col_name = match.group(1)
            return f"{col_name} CHECK ({col_name} >= 0)"
        
        table_def = re.sub(
            r'(\w+)\s+(?:INT|BIGINT|SMALLINT|TINYINT)\s+UNSIGNED',
            replace_unsigned,
            table_def,
            flags=re.IGNORECASE
        )
        
        # Convert DATETIME to TIMESTAMP
        table_def = re.sub(
            r'DATETIME',
            'TIMESTAMP',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Convert TEXT types
        table_def = re.sub(
            r'LONGTEXT',
            'TEXT',
            table_def,
            flags=re.IGNORECASE
        )
        table_def = re.sub(
            r'MEDIUMTEXT',
            'TEXT',
            table_def,
            flags=re.IGNORECASE
        )
        table_def = re.sub(
            r'TINYTEXT',
            'TEXT',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Convert BLOB types to BYTEA
        table_def = re.sub(
            r'(?:TINY|MEDIUM|LONG)?BLOB',
            'BYTEA',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Convert ENGINE and CHARSET clauses
        table_def = re.sub(
            r'ENGINE\s*=\s*\w+',
            '',
            table_def,
            flags=re.IGNORECASE
        )
        table_def = re.sub(
            r'CHARACTER\s+SET\s+\w+',
            '',
            table_def,
            flags=re.IGNORECASE
        )
        table_def = re.sub(
            r'COLLATE\s+\w+',
            '',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Remove backticks
        table_def = table_def.replace('`', '')
        
        # Handle MySQL-specific data types
        table_def = re.sub(
            r'TINYINT(?:\(\d+\))?',
            'SMALLINT',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Convert MySQL boolean to PostgreSQL boolean
        table_def = re.sub(
            r'TINYINT\(\d+\)\s+NOT\s+NULL\s+DEFAULT\s+[01]',
            'BOOLEAN NOT NULL DEFAULT FALSE',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Remove MySQL-specific attributes
        table_def = re.sub(
            r'ON\s+UPDATE\s+CURRENT_TIMESTAMP',
            '',
            table_def,
            flags=re.IGNORECASE
        )
        
        # Convert MySQL-specific functions
        table_def = re.sub(
            r'CURRENT_TIMESTAMP\(\)',
            'CURRENT_TIMESTAMP',
            table_def,
            flags=re.IGNORECASE
        )
        
        return table_def

    # Process CREATE TABLE statements
    sql_content = re.sub(
        r'CREATE\s+TABLE\s+.*?;',
        convert_create_table,
        sql_content,
        flags=re.IGNORECASE | re.DOTALL
    )
    
    # Handle any remaining AUTO_INCREMENT outside CREATE TABLE
    sql_content = re.sub(
        r'AUTO_INCREMENT',
        '',
        sql_content,
        flags=re.IGNORECASE
    )
    
    return sql_content

if __name__ == "__main__":
    # Read from stdin if no file provided
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            sql_content = f.read()
    else:
        sql_content = sys.stdin.read()
    
    # Convert and output
    converted = convert_sql_schema(sql_content)
    print(converted) 
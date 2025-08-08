import * as winston from 'winston';
import chalk from 'chalk';

const myFormat = winston.format.printf(
    ({ level, message, label, timestamp }) => {
        return `${timestamp} ${level}: ${label ? label : ''}${message}`;
    },
);

const tagToColor = {
    green: chalk.green,
    red: chalk.red,
    yellow: chalk.yellow,
    blue: chalk.blue,
};

const colorizeTags = winston.format((info) => {
    let message = info.message;
    // Replace <info>...</info> with colored text
    message = (message as string).replace(
        /<(\w+)>(.*?)<\/\1>/g,
        (match, tag, content) => {
            const color = tagToColor[tag];
            return color ? color(content) : content;
        },
    );
    info.message = message;
    return info;
});

export function createLogger(level: string = 'info') {
    return winston.createLogger({
        level,
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.colorize(),
                    colorizeTags(),
                    myFormat,
                ),
            }),
        ],
    });
}

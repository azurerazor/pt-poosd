interface Props {
    href: string;
    text: string;
}

const Link: React.FC<Props> = ({ href, text }) => {
    return (
        <a href={href} className="link link-hover text-primary">{text}</a>
    )
}
export default Link;

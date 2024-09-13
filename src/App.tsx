import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";

function App() {
    const [choosed, setChoosed] = useState<number | undefined>(undefined);
    const [choosedYear, setChoosedYear] = useState<number | undefined>(undefined);
    const [questionCount, setQuestionCount] = useState<number>(1);
    const [currentQuestion, setCurrentQuestion] = useState<any>('');
    const [finalScore, setFinalScore] = useState<number>(0);
    const [answered, setAnsewered] = useState([]);
    const examType = [{
        id: 1,
        title: 'Poscomp',
        questions: 70,
        description: "O Exame Nacional para Ingresso na Pós-Graduação em Computação (POSCOMP) é um exame aplicado em todas as regiões do País."
    }, {
        id: 2,
        title: 'Enem',
        questions: 90,
        description: "O Enem é o Exame Nacional do Ensino Médio, uma prova destinada aos estudantes que já terminaram o ensino médio. Com as notas do Enem, os alunos podem ingressar no ensino superior por meio de programas do Ministério da Educação (MEC)."
    }, {
        id: 3,
        title: 'Vestibular',
        questions: 90,
        description: "O vestibular é um processo seletivo adotado por diversas instituições de ensino superior para escolher os alunos que serão admitidos em seus cursos."
    }]

    const letters = ['A', 'B', 'C', 'D', 'E'];

    const poscompYears = [2016, 2017, 2018, 2019, 2022, 2023]
    useEffect(() => {
        if (choosedYear) {
            const formattedQuestionCount = questionCount?.toString().padStart(2, '0');

            fetch(`../exam-db/poscomp/${choosedYear}/${formattedQuestionCount}.json`)
                .then(response => response.json())
                .then(data => {
                    setCurrentQuestion(data);
                })
                .catch(error => {
                    console.error('Erro ao carregar os dados:', error);
                });
        }
    }, [choosedYear, questionCount]);

    console.log(currentQuestion)


    const handleAnswer = (value: number) => {
        const answerData = {
            question: currentQuestion,
            userAnswer: value,
            correctAnswer: currentQuestion.correctAnswer
        };
        const savedAnswers = JSON.parse(localStorage.getItem('userAnswers') as string) || [];
        savedAnswers.push(answerData);
        localStorage.setItem('userAnswers', JSON.stringify(savedAnswers));
        setQuestionCount(questionCount + 1);
    }

    useEffect(() => {
        if (questionCount === 71) {
            const savedAnswers = JSON.parse(localStorage.getItem('userAnswers') as string);

            setAnsewered(savedAnswers)

            const totalQuestions = savedAnswers.length;
            const correctAnswers = savedAnswers.filter((answer: any) => answer.userAnswer === answer.question.Resposta).length;
            const score = (correctAnswers / totalQuestions) * 100;
            console.log(`Sua pontuação: ${score}%`);
            setFinalScore(score)
            console.log(savedAnswers)
        }

    }, [questionCount]);

    return (
        <div className="w-screen p-5">
            {!choosed && !choosedYear && (
                <div className={`h-screen flex justify-center items-center ${choosed ? "hidden" : "flex"}`}>
                    {examType.map(item => (
                        <Card className="mx-5 hover:cursor-pointer" key={item.id}>
                            <CardHeader onClick={() => {
                                setChoosed(item.id)
                            }}>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Numero de questões: {item.questions}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>)}


            {choosed && !choosedYear && (
                <div className={`${choosedYear ? "hidden" : "flex"}`}>
                    <div className="h-screen flex justify-center items-center">
                        {poscompYears.map(item => (
                            <Card className="mx-5 hover:cursor-pointer" key={item}>
                                <CardHeader onClick={() => {
                                    setChoosedYear(item)
                                }}>
                                    <CardTitle>{item}</CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            )}


            {currentQuestion && questionCount <= 70 && (
                <div className={`${choosedYear ? "flex" : "hidden"} flex-col justify-center items-center w-full`}>
                    <strong className="text-3xl pb-5">{currentQuestion?.Componente}</strong>
                    <div className="flex-col justify-center items-cente w-full">
                        <Card className="mx-5 hover:cursor-pointer">
                            <CardHeader>
                                <CardTitle>{currentQuestion?.Numero} - {currentQuestion?.Subarea}</CardTitle>
                                <CardDescription>{currentQuestion?.Enunciado}</CardDescription>
                            </CardHeader>
                        </Card>
                        <strong className="flex justify-center text-xl m-2 text-center">Alternativas</strong>
                        <div className="flex-row">
                            {currentQuestion?.Alternativas.map((item: any, index: number) => (
                                <Card className="m-5 hover:cursor-pointer" key={index}
                                      onClick={() => handleAnswer(index)}>
                                    <CardHeader>
                                        <CardTitle>{letters[index]}.</CardTitle>
                                        <CardDescription>{item}</CardDescription>
                                    </CardHeader>
                                </Card>))}
                        </div>
                    </div>
                </div>
            )}

            {questionCount === 71 ? (
                <div className={`flex-col justify-center items-center`}>
                    <strong className="text-3xl pb-5">Respostas </strong>
                    <strong className="text-3xl pb-5">{finalScore.toFixed(0)}%</strong>

                    <div>
                        {answered
                            .filter((answer: any) => answer.userAnswer !== answer.question.Resposta)
                            .map((answer: any, index) => (
                                <div key={index} className="my-3">
                                    <div className="p-3 bg-cyan-950 rounded-md mt-10 mb-3">
                                        <h3 className="text-xl font-black text-center">Questão {index + 1}:</h3>
                                        <p>Enunciado: {answer.question.Enunciado}</p>
                                    </div>

                                    <div className="p-3 bg-cyan-900 rounded-md mb-5">
                                        <p className="bg-green-700 p-3 rounded  my-2">
                                            <span
                                                className="text-xl font-black">Sua resposta: </span>{answer.question.Alternativas[answer.userAnswer]}
                                        </p>
                                        <p className="bg-red-900 p-3 rounded my-2"><span
                                            className="text-xl font-black">Resposta correta: </span>{answer.question.Alternativas[answer.question.Resposta]}
                                        </p>
                                    </div>


                                </div>
                            ))}
                    </div>
                </div>
            ) : ''}


        </div>
    )
}

export default App

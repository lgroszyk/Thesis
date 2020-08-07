using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.ML;
using Microsoft.ML.Core.Data;
using Microsoft.ML.Data;
using Microsoft.ML.Trainers;
using Microsoft.ML.Transforms;
using Microsoft.ML.Transforms.Text;

namespace AnalyticSystemTest
{
    // Aplikacja konsolowa do stworzenia i oceny jakości modelu analitycznego.
    class Program
    {
        static Random randomGenerator;

        // Reprezentuje ofertę sprzedaży książki do antykwariatu.
        public class Offer
        {
            [LoadColumn(0)]
            public string AuthorPopularity;

            [LoadColumn(1)]
            public string Condition;

            [LoadColumn(2)]
            public string Category;
            
            [LoadColumn(3)]
            public string Language;
            
            [LoadColumn(4)]
            public bool IsEbook;
            
            [LoadColumn(5)]
            public string WritingTime;
            
            [LoadColumn(6)]
            public string PrintingTime;
            
            [LoadColumn(7)]
            public float TransactionPrice;
        }

        // Reprezentuje cenę oferowanej książki przewidzianą przez system analityczny.
        public class OfferPrediction
        {
            [ColumnName("Score")]
            public float TransactionPrice { get; set; }
        }
        
        // Wywołuje generujowanie danych i modelu analitycznego (jeśli nie istnieją) oraz wywołuje ocenę systemu.
        static void Main(string[] args)
        {
            var isDataGenerated = File.Exists("train.csv") && File.Exists("test.csv");
            if (!isDataGenerated)
            {
                GenerateData();
            }

            var isAnalyticModelCreated = File.Exists("model.zip");
            if (!isAnalyticModelCreated)
            {
                GenerateAnalyticModel();
            }
                 
            EvaluateModel();
        }

        // Ocenia jakość modelu analitycznego.
        static void EvaluateModel()
        {
            var mlContext = new MLContext(seed: 0);

            ITransformer model;
            using (var stream = new FileStream("model.zip", FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                model = mlContext.Model.Load(stream);
            }
            
            var predictionFunction = model.CreatePredictionEngine<Offer, OfferPrediction>(mlContext);

            var testData = File.ReadAllLines("test.csv")
                .Skip(1)
                .Select(x => 
                {
                    var line = x.Split(',');
                    return new Offer
                    {
                        AuthorPopularity = line[0],
                        Condition = line[1],
                        Category = line[2],
                        Language = line[3],
                        IsEbook = bool.Parse(line[4]),
                        WritingTime = line[5],
                        PrintingTime = line[6],
                        TransactionPrice = float.Parse(line[7])
                    };
                });
            var rowsCount = testData.Count();

            var sumOfDifferences = 0.0m;
            foreach (var offer in testData)
            {
                var realPrice = (decimal)CalcPrice(offer);
                var calculatedPrice = (decimal)predictionFunction.Predict(offer).TransactionPrice;
                var difference = Math.Abs(realPrice - calculatedPrice);
                
                sumOfDifferences += difference;
            }
            var averageDifference = sumOfDifferences / rowsCount;

            var variancyNumerator = 0.0m;
            foreach (var offer in testData)
            {
                var realPrice = (decimal)CalcPrice(offer);
                var calculatedPrice = (decimal)predictionFunction.Predict(offer).TransactionPrice;
                var difference = Math.Abs(realPrice - calculatedPrice);

                var differenceBetweenAverage = difference - averageDifference;
                variancyNumerator += differenceBetweenAverage * differenceBetweenAverage;
            }
            var variancy = variancyNumerator / rowsCount;
            var standardDeviation = Math.Sqrt((double)variancy);

            Console.WriteLine($"Średnia różnica między ceną prawdziwą a przewidzianą: {Math.Round(averageDifference,5)}");
            Console.WriteLine($"Odchylenie standardowe różnicy między ceną prawdziwą a przewidzianą: {Math.Round(standardDeviation,5)}");
        }
        
        // Generuje model analityczny i zapisuje go do pliku zip.
        static void GenerateAnalyticModel()
        {
            var mlContext = new MLContext(seed: 0);

            var textLoader = mlContext.Data.CreateTextLoader(
                columns: new TextLoader.Column[] 
                {
                    new TextLoader.Column("AuthorPopularity", DataKind.Text, 0),
                    new TextLoader.Column("Condition", DataKind.Text, 1),
                    new TextLoader.Column("Category", DataKind.Text, 2),
                    new TextLoader.Column("Language", DataKind.Text, 3),
                    new TextLoader.Column("IsEbook", DataKind.Bool, 4),
                    new TextLoader.Column("WritingTime", DataKind.Text, 5),
                    new TextLoader.Column("PrintingTime", DataKind.Text, 6),
                    new TextLoader.Column("TransactionPrice", DataKind.R4, 7)
                },
                separatorChar: ',',
                hasHeader: true
            );

            var pipeline = mlContext.Transforms.CopyColumns(inputColumnName:"TransactionPrice", outputColumnName:"Label")
                .Append(mlContext.Transforms.Categorical.OneHotEncoding("AuthorPopularity"))
                .Append(mlContext.Transforms.Categorical.OneHotEncoding("Condition"))
                .Append(mlContext.Transforms.Categorical.OneHotEncoding("Category"))
                .Append(mlContext.Transforms.Categorical.OneHotEncoding("Language"))
                .Append(mlContext.Transforms.Categorical.OneHotEncoding("IsEbook"))
                .Append(mlContext.Transforms.Categorical.OneHotEncoding("WritingTime"))
                .Append(mlContext.Transforms.Categorical.OneHotEncoding("PrintingTime"))
                .Append(mlContext.Transforms.Concatenate("Features", "AuthorPopularity", "Condition", "Category", "Language", "IsEbook", "WritingTime", "PrintingTime"))
                .Append(mlContext.Regression.Trainers.FastTree());

            var dataViewTrain = textLoader.Read("train.csv");
            var model = pipeline.Fit(dataViewTrain);

            var dataViewTest = textLoader.Read("test.csv"); 
            var predictions = model.Transform(dataViewTest);
            var metrics = mlContext.Regression.Evaluate(predictions, "Label", "Score");

            using (var fileStream = new FileStream("model.zip", FileMode.Create, FileAccess.Write, FileShare.Write))
            {
                mlContext.Model.Save(model, fileStream);
            }      
        } 

        // Generuje dane uczące i testowe.
        static void GenerateData()
        {
            randomGenerator = new Random(); 

            using(StreamWriter sw = new StreamWriter("train.csv"))
            {
                sw.WriteLine("AuthorPopularity,Condition,Category,Language,IsEbook,WritingTime,PrintingTime,TransactionPrice");
                for (int i = 0; i < 600; i++)
                {
                    GenerateRow(sw);
                }
            }

            using(StreamWriter sw = new StreamWriter("test.csv"))
            {
                sw.WriteLine("AuthorPopularity,Condition,Category,Language,IsEbook,WritingTime,PrintingTime,TransactionPrice");
                for (int i = 0; i < 400; i++)
                {
                    GenerateRow(sw);
                }
            }
        }

        // Generuje podaną liczbę ofert.
        static IEnumerable<Offer> GenerateNRows(int n)
        {
            if (randomGenerator == null)
            {
                randomGenerator = new Random(); 
            }

            for (int i = 0; i < n; i++)
            {
                yield return CreateRow();
            }
        }

        // Oblicza prawdziwą cenę książki.
        static float CalcPrice(Offer offer)
        {
            var maxPrice = 0;
            var isAntique = offer.PrintingTime == "Od 100 lat";

            if (isAntique)
            {
                switch (offer.AuthorPopularity)
                {
                    case "Znany": 
                    case "Znany i bardzo popularny": 
                    case "Nieznany": 
                    default: break;
                }

                switch (offer.Condition)
                {
                    case "Średni": maxPrice += 2; break;
                    case "Dobry": maxPrice += 5; break;
                    default: break;
                }

                switch (offer.Category)
                {
                    case "Sztuka": case "Poezja": maxPrice += 2; break;
                    default: break;
                }

                switch (offer.Language)
                {
                    case "Polski": maxPrice += 2; break;
                    default: break;
                }

                switch (offer.WritingTime)
                {
                    case "Do 10 lat":
                    case "Od 10 do 50 lat": 
                    case "Od 50 do 100 lat":
                    case "Od 100 do 500 lat": 
                    case "Od 500 lat": 
                    default: break;
                }

                switch (offer.PrintingTime)
                {
                    case "Do 1 roku": 
                    case "Od 1 do 5 lat": 
                    case "Od 5 do 10 lat": 
                    case "Od 10 do 20 lat": 
                    case "Od 20 do 100 lat": 
                    case "Od 100 lat":
                    default: break;
                }

                maxPrice += 15;
                return maxPrice;
            }

            switch (offer.AuthorPopularity)
            {
                case "Znany": maxPrice += 2; break;
                case "Znany i bardzo popularny": maxPrice += 5; break;
                case "Nieznany": default: break;
            }

            switch (offer.Condition)
            {
                case "Średni": maxPrice += 2; break;
                case "Dobry": case "Brak (Ebook)": maxPrice += 3; break;
                default: break;
            }

            switch (offer.Category)
            {
                case "Popularnonaukowe": case "Sztuka": case "Poezja": break;
                default: maxPrice += 3; break;
            }

            switch (offer.Language)
            {
                case "Polski": maxPrice += 2; break;
                default: break;
            }

            switch (offer.WritingTime)
            {
                case "Do 10 lat": maxPrice += 4; break;
                case "Od 10 do 50 lat": maxPrice += 3; break;
                case "Od 50 do 100 lat": maxPrice += 2; break;
                case "Od 100 do 500 lat":
                case "Od 500 lat":
                default: break;
            }

            switch (offer.PrintingTime)
            {
                case "Do 1 roku": maxPrice += 3; break;
                case "Od 1 do 5 lat": maxPrice += 2; break;
                case "Od 5 do 10 lat":
                case "Od 10 do 20 lat":
                case "Od 20 do 100 lat":
                case "Od 100 lat":
                default: break;
            }

            return maxPrice;
        }

        // Tworzy dane o pojedynczej ofercie.
        static Offer CreateRow()
        {
            int random;

            string author;
            random = randomGenerator.Next(0, 100);
            if (random < 30) author = "Nieznany";
            else if (random > 30 && random < 60) author = "Znany";
            else author = "Znany i bardzo popularny";

            string condition;
            random = randomGenerator.Next(0, 100);
            if (random < 10) condition = "Zły";
            else if (random > 10 && random < 20) condition = "Średni";
            else condition = "Dobry";

            string category;
            random = randomGenerator.Next(0, 100);
            if (random < 25) category = "Inna";
            else if (random > 25 && random < 40) category = "Powieść";
            else if (random > 40 && random < 55) category = "Historia";
            else if (random > 55 && random < 67) category = "Dziecięce";
            else if (random > 67 && random < 77) category = "Kobiece";
            else if (random > 77 && random < 85) category = "Biografia";
            else if (random > 85 && random < 91) category = "Podróże";
            else if (random > 91 && random < 96) category = "Popularnonaukowe";
            else if (random > 96 && random < 99) category = "Sztuka";
            else category = "Poezja";

            string language;
            random = randomGenerator.Next(0, 100);
            if (random < 90) language = "Polski";
            else if (random > 90 && random < 98) language = "Angielski";
            else language = "Inny";

            bool isElectronic;
            random = randomGenerator.Next(0, 100);
            if (random > 20) isElectronic = false;
            else isElectronic = true;
            
            if (isElectronic) condition = "Brak (Ebook)";

            string howOldWroten;
            random = randomGenerator.Next(0, 100);
            if (random < 30) howOldWroten = "Do 10 lat";
            else if (random > 30 && random < 60) howOldWroten = "Od 10 do 50 lat";
            else if (random > 60 && random < 70) howOldWroten = "Od 50 do 100 lat";
            else if (random > 70 && random < 90) howOldWroten = "Od 100 do 500 lat";
            else howOldWroten = "Od 500 lat";

            string howOldPrinted;
            if (howOldWroten == "Od 10 do 50 lat" || howOldWroten == "Do 10 lat")
            {
                random = randomGenerator.Next(0, 100);
                if (random < 30) howOldPrinted = "Do 1 roku";
                else if (random > 30 && random < 60) howOldPrinted = "Od 1 do 5 lat";
                else howOldPrinted = "Od 5 do 10 lat";
            }
            else
            {
                random = randomGenerator.Next(0, 100);
                if (random < 30) howOldPrinted = "Do 1 roku";
                else if (random > 30 && random < 60) howOldPrinted = "Od 1 do 5 lat";
                else if (random > 60 && random < 70) howOldPrinted = "Od 5 do 10 lat";
                else if (random > 70 && random < 80) howOldPrinted = "Od 10 do 20 lat";
                else if (random > 80 && random < 90) howOldPrinted = "Od 20 do 100 lat";
                else howOldPrinted = "Od 100 lat";
            }

            if (isElectronic)
            {
                random = randomGenerator.Next(0, 100);
                if (random < 30) howOldPrinted = "Do 1 roku";
                else if (random > 30 && random < 70) howOldPrinted = "Od 1 do 5 lat";
                else howOldPrinted = "Od 5 do 10 lat";
            }

            var offer = new Offer
            {
                AuthorPopularity = author,
                Condition = condition,
                Category = category,
                Language = language,
                IsEbook = isElectronic,
                WritingTime = howOldWroten,
                PrintingTime = howOldPrinted
            };

            return offer;
        }

        // Zapisuje do pliku pojedynczą ofertę.
        static void GenerateRow(StreamWriter sw)
        {
            var offer = CreateRow();

            float sellPrice = 0;
            float maxPrice = CalcPrice(offer);

            var diference = randomGenerator.Next(0, 2);
            sellPrice = maxPrice - diference;
            if (sellPrice <= 0) sellPrice = 1;

            sw.WriteLine($"{offer.AuthorPopularity},{offer.Condition},{offer.Category},{offer.Language},{offer.IsEbook},{offer.WritingTime},{offer.PrintingTime},{sellPrice}");
        }
    }
}
